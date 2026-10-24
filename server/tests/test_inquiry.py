"""Run: python -m pytest server/tests  (or: python server/tests/test_inquiry.py)"""
import sys, os
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import app as srv

sent = []
srv.send_telegram = lambda text: sent.append(text) or True

def good(**kw):
    d = dict(name="Олена Шевченко-Мельник", contact="+380 67 123 45 67", type="пара",
             date=(date.today() + timedelta(days=3)).isoformat(), slot="вечір", exact_time="",
             comment="<b>тест</b> & «лапки»", website="", elapsed_ms=9000)
    d.update(kw); return d

def client():
    srv.limiter.reset(); return srv.app.test_client()

def test_ok_and_escaping():
    c = client(); sent.clear()
    r = c.post("/api/inquiry", json=good())
    assert r.status_code == 202, r.json
    assert "&lt;b&gt;тест&lt;/b&gt; &amp;" in sent[-1]

def test_handle_and_exact_time():
    c = client()
    assert c.post("/api/inquiry", json=good(contact="@olena_ph", slot="точний", exact_time="18:30")).status_code == 202
    r = c.post("/api/inquiry", json=good(slot="точний", exact_time="23:30"))
    assert r.status_code == 400 and "exactTime" in r.json["errors"]

def test_validation_errors():
    c = client()
    r = c.post("/api/inquiry", json=good(name="1", contact="abc", type="x", date="2001-01-01", slot="ніч", comment="я" * 1001))
    assert r.status_code == 400
    assert set(r.json["errors"]) == {"name", "contact", "type", "date", "slot", "comment"}

def test_honeypot_and_too_fast_are_silent():
    c = client(); sent.clear()
    assert c.post("/api/inquiry", json=good(website="http://spam")).status_code == 202
    assert c.post("/api/inquiry", json=good(elapsed_ms=300)).status_code == 202
    assert sent == []

def test_garbage_body():
    c = client()
    assert c.post("/api/inquiry", data="nope", content_type="application/json").status_code == 400
    assert c.post("/api/inquiry", json=["x"]).status_code == 400
    assert c.post("/api/inquiry", data="x" * 20000, content_type="application/json").status_code == 413

def test_rate_limit():
    c = client()
    codes = [c.post("/api/inquiry", json=good()).status_code for _ in range(7)]
    assert codes[:5] == [202] * 5 and codes[5] == 429, codes

def test_telegram_failure_502():
    c = client()
    orig = srv.send_telegram; srv.send_telegram = lambda t: False
    try:
        assert c.post("/api/inquiry", json=good()).status_code == 502
    finally:
        srv.send_telegram = orig

if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"): f(); print("✓", k)
