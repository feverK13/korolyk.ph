"""
Flask backend for inquiry requests → Telegram.

Env (see .env.example):
  TELEGRAM_BOT_TOKEN   bot token (server-side only, never sent to the browser)
  TELEGRAM_CHAT_ID     photographer's chat id
  TRUST_PROXY=1        if running behind nginx / a PaaS proxy (for correct client IP)
  RATELIMIT_STORAGE_URI  e.g. redis://localhost:6379 in production (default: memory)
  STATIC_DIR           optional path to the built frontend (dist) to serve it from Flask
"""
from __future__ import annotations

import html
import logging
import os
import re
from datetime import date, datetime, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()
log = logging.getLogger("inquiry")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

SHOOT_TYPES = {"портрет", "пара", "сімейна", "репортаж", "інше"}
SLOTS = {"ранок": "ранок (8:00–11:00)", "день": "день (12:00–16:00)", "вечір": "вечір (17:00–20:00)", "точний": "точний час"}
NAME_RE = re.compile(r"^[^\W\d_](?:[^\W\d_]|[\s'’ʼ.-])*$", re.UNICODE)
PHONE_RE = re.compile(r"^\+?[\d\s()-]{10,20}$")
HANDLE_RE = re.compile(r"^@?[a-zA-Z][a-zA-Z0-9_.]{3,31}$")
LINK_RE = re.compile(r"^(https?://)?(t\.me|telegram\.me|instagram\.com|www\.instagram\.com)/[a-zA-Z0-9_.]{4,32}/?$", re.I)
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
MIN_FILL_MS = 2500  # faster than this = almost certainly a bot

STATIC_DIR = os.getenv("STATIC_DIR")
app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
if os.getenv("TRUST_PROXY") == "1":
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)  # type: ignore[assignment]

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
    default_limits=[],
)


@app.errorhandler(429)
def too_many(_e):
    return jsonify(ok=False, message="Забагато спроб. Спробуйте за хвилину."), 429


@app.errorhandler(413)
def too_large(_e):
    return jsonify(ok=False, message="Запит завеликий."), 413


def _contact_ok(s: str) -> bool:
    digits = re.sub(r"\D", "", s)
    if PHONE_RE.match(s) and 10 <= len(digits) <= 15:
        return True
    return bool(HANDLE_RE.match(s) or LINK_RE.match(s))


def validate(d: dict) -> tuple[dict, dict]:
    errors: dict[str, str] = {}
    clean: dict[str, str] = {}

    name = str(d.get("name", "")).strip()
    if not (2 <= len(name) <= 60) or not NAME_RE.match(name):
        errors["name"] = "Перевірте імʼя."
    clean["name"] = name

    contact = str(d.get("contact", "")).strip()
    if not contact or len(contact) > 64 or not _contact_ok(contact):
        errors["contact"] = "Вкажіть телефон або нік у месенджері."
    clean["contact"] = contact

    stype = str(d.get("type", ""))
    if stype not in SHOOT_TYPES:
        errors["type"] = "Оберіть тип зйомки."
    clean["type"] = stype

    try:
        day = date.fromisoformat(str(d.get("date", "")))
        today = date.today()
        # allow 1 day slack for timezone differences between client and server
        if day < today - timedelta(days=1) or day > today + timedelta(days=370):
            raise ValueError
        clean["date"] = day.isoformat()
    except ValueError:
        errors["date"] = "Оберіть коректну дату."

    slot = str(d.get("slot", ""))
    if slot not in SLOTS:
        errors["slot"] = "Оберіть час."
    clean["slot"] = slot
    exact = str(d.get("exact_time", ""))
    if slot == "точний":
        if not TIME_RE.match(exact) or not ("07:00" <= exact <= "21:00"):
            errors["exactTime"] = "Вкажіть час з 7:00 до 21:00."
    clean["exact_time"] = exact if slot == "точний" else ""

    comment = str(d.get("comment", "")).strip()
    if len(comment) > 1000:
        errors["comment"] = "Коментар задовгий."
    clean["comment"] = comment
    return clean, errors


UA_MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"]
UA_DAYS = ["понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота", "неділя"]


def format_message(c: dict) -> str:
    def e(v: str) -> str:
        return html.escape(v, quote=False)

    d = date.fromisoformat(c["date"])
    when = f"{d.day} {UA_MONTHS[d.month - 1]}, {UA_DAYS[d.weekday()]}"
    time = f"о {c['exact_time']}" if c["slot"] == "точний" else SLOTS[c["slot"]]
    contact = c["contact"]
    digits = re.sub(r"[^\d+]", "", contact)
    contact_line = e(contact)
    if contact.startswith("@"):
        contact_line = f'<a href="https://t.me/{e(contact[1:])}">{e(contact)}</a>'
    elif PHONE_RE.match(contact):
        contact_line = f"<code>{e(digits)}</code>"
    lines = [
        "📷 <b>Нова заявка</b>",
        "",
        f"<b>Імʼя:</b> {e(c['name'])}",
        f"<b>Звʼязок:</b> {contact_line}",
        f"<b>Зйомка:</b> {e(c['type'])}",
        f"<b>Дата:</b> {e(when)}",
        f"<b>Час:</b> {e(time)}",
    ]
    if c["comment"]:
        lines += ["", f"<b>Коментар:</b>\n{e(c['comment'])}"]
    lines += ["", f"<i>{datetime.now():%d.%m.%Y %H:%M}</i>"]
    return "\n".join(lines)


def send_telegram(text: str) -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        log.warning("Telegram is not configured — printing the inquiry instead:\n%s", text)
        return True
    try:
        r = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True},
            timeout=8,
        )
        if r.status_code != 200:
            log.error("Telegram error %s: %s", r.status_code, r.text[:300])
        return r.status_code == 200
    except requests.RequestException as ex:  # never log the token-bearing URL
        log.error("Telegram request failed: %s", type(ex).__name__)
        return False


@app.post("/api/inquiry")
@limiter.limit("5 per minute; 20 per day")
def inquiry():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(ok=False, message="Некоректний запит."), 400

    # honeypot / too-fast → pretend success, drop silently
    if str(data.get("website", "")).strip():
        log.info("honeypot hit from %s", get_remote_address())
        return jsonify(ok=True), 202
    try:
        if int(data.get("elapsed_ms", 0)) < MIN_FILL_MS:
            log.info("too fast submission from %s", get_remote_address())
            return jsonify(ok=True), 202
    except (TypeError, ValueError):
        return jsonify(ok=True), 202

    clean, errors = validate(data)
    if errors:
        return jsonify(ok=False, message="Перевірте поля форми.", errors=errors), 400

    if not send_telegram(format_message(clean)):
        return jsonify(ok=False, message="Не вдалося доставити заявку."), 502
    return jsonify(ok=True), 202


@app.get("/api/health")
@limiter.exempt
def health():
    return jsonify(ok=True)


if STATIC_DIR:
    root = Path(STATIC_DIR).resolve()

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def spa(path: str):
        target = root / path
        if path and target.is_file():
            return send_from_directory(root, path, max_age=31536000 if path.startswith("assets/") else 3600)
        return send_from_directory(root, "index.html", max_age=0)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
