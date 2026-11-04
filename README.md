# korolyk*ph: лендінг фешн-фотографки

React + Vite + TypeScript, Tailwind v4, shadcn/ui (Accordion, Sheet), framer-motion. Статичний односторінковий сайт (пререндер у HTML), деплой на Vercel. Звʼязок лише через Instagram.

## Запуск
```bash
npm i
npm run dev         # Vite на :5173
npm run build       # tsc + vite build + SSR + пререндер: dist/ зі статичним HTML
npm run preview     # локальний перегляд зібраного dist/
npm run lint        # oxlint
node --experimental-strip-types scripts/check-seo.mjs   # перевірка SEO після build
```
Тест на телефоні: `npm run dev -- --host` і відкрити `http://<IP>:5173`.
Перед деплоєм увімкніть gzip або brotli на хостингу/CDN.

## Що замінити
- Імʼя, місто, контакти (Instagram), ціни, послуги, кроки, FAQ і блок SEO лежать у `src/config.ts`. Тексти вставляються дослівно.
- Мета-теги не правляться вручну: блок між `seo:start` і `seo:end` в `index.html` під час `npm run build` замінюється згенерованим з `src/config.ts` (`seo`).
- Фото лежать у `public/img`, імена за схемою: `anastasia-p01…` (портрети), `anastasia-m01…`, `yaroslava-m01…`, `igor-m01…` (роботи), `services01…03` (послуги).
- Фото додавайте з природними пропорціями файлу. У `works` у `config.ts` вказуйте реальні `w` і `h` в пікселях: слот береться з них, фото не обрізається. Для послуг це 853×1280.
- Службові файли: `hero-blur.jpg` (готовий розмитий шар hero, перехід у чітке фото через opacity), `og.jpg` (1200×630, превʼю в соцмережах), `grain.png` (зерно).
- `scripts/placeholders.py` генерував тимчасові заглушки на старті проєкту і для поточних фото не потрібен.

## SEO
Усе генерується з блоку `seo` у `src/config.ts` під час `npm run build` (`src/seo.ts` → `scripts/prerender.mjs`):
- `<title>`, description, robots, canonical, hreflang, Open Graph, Twitter Card;
- JSON-LD: `WebSite`, `Person`, `ProfessionalService` з каталогом послуг, `ImageGallery`, `FAQPage` — з тих самих даних, що на сторінці;
- `dist/sitemap.xml` і `dist/robots.txt` з посиланням на sitemap.

Домен задається змінною середовища, а не в коді (див. нижче).
Сторінка пререндерена в HTML, тож пошуковики бачать текст без JS; у кожної секції один `h2`, у сторінки один `h1`. Телефону в даних і розмітці немає. Після `npm run build` запускайте `scripts/check-seo.mjs`: він звіряє JSON-LD із конфігом і шукає плейсхолдери.

## Налаштування домену
Домен — одна змінна: **`VITE_SITE_URL`** (повна адреса без слеша в кінці, наприклад `https://korolyk.example`). Вона читається під час збірки (`scripts/prerender.mjs`) і будує canonical, hreflang, `og:url`, sitemap, robots та JSON-LD.

Індексація вмикається лише коли виконані обидві умови: `VITE_SITE_URL` задано **і** `VERCEL_ENV=production`. В усіх інших випадках (preview-гілки, `*.vercel.app` без змінної, локально) збірка має `noindex, nofollow`, `robots.txt` з `Disallow: /`, без sitemap, canonical і `og:url`. Без `VITE_SITE_URL` збірка не падає, а друкує попередження `[seo]`.

**Як підключити домен:**
1. Vercel → Project → Settings → Domains: додати домен і прописати DNS.
2. Vercel → Settings → Environment Variables: `VITE_SITE_URL` = `https://ваш-домен`, середовище **Production** (для Preview не задавати).
3. Зробити Redeploy продакшн-деплою (змінні зчитуються під час збірки, без перезбірки нічого не зміниться).
4. Перевірити `https://ваш-домен/robots.txt` (має бути `Allow: /` і `Sitemap:`) та `view-source` (`index, follow`, canonical на ваш домен), потім додати сайт у Google Search Console й подати `sitemap.xml`.

## Рішення
Принципи стилю описані в `STYLE-LOCK.md`, правила роботи з проєктом (захищені зони, перевірки) в `AGENTS.md`. Нижче технічні рішення, які варто знати.
- **Стек секцій на нативному `position: sticky`.** Скрол веде компоузитор браузера, тому картки не відстають від пальця. `useStack.ts` через ResizeObserver міряє висоту карток у `--stack-h` (CSS: `top = min(0px, calc(100svh - var(--stack-h)))`) і затемнює нижню картку. Паралакс фото й дрейф hero — CSS scroll-driven animations; браузери без `animation-timeline` показують нерухоме фото. Фото в «Послугах» без паралакса, щоб не обрізались (`parallax={false}`).
- **Hero.** Розмитий шар заздалегідь підготовлений і переходить у чітке фото через opacity. Живого `filter: blur` немає.
- **FAQ.** Акордеон розкривається анімацією висоти: це прямо було в брифі. Це єдиний виняток із правила «тільки transform/opacity».
