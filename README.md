# Лендінг фотографки

React + Vite + TypeScript, Tailwind v4, shadcn/ui (Accordion, Sheet), framer-motion. Статичний сайт: звʼязок через телефон та Instagram.

## Запуск
```bash
npm i
npm run dev         # Vite на :5173
npm run build       # dist/ з пререндереним HTML (SSR → hydrate), роздавати як статику
```
Перед деплоєм увімкніть gzip або brotli на хостингу/CDN.

## Що замінити
- Імʼя, місто, контакти, ціни, послуги й FAQ лежать у `src/config.ts`. Плейсхолдери позначені `[ ]`.
- Мета-теги — в `index.html`.
- Фото — в `public/img`. Пропорції треба зберегти:
  - `hero.webp` — 4:5. До нього `hero-blur.webp`: ~300px завширшки, з горизонтальним motion-blur, щоб hero плавно переходив із розмитого фото в чітке.
  - `work-*` — 1:1, 3:2, 7:3, 3:4, 4:5.
  - `svc-*` — 4:5.
  - `contact.webp` — 4:5.
- Для обробки фото є скрипт `scripts/placeholders.py`. Він показує, як згенерувати blur-шар.

## SEO
Усе генерується з блоку `seo` у `src/config.ts` під час `npm run build` (`src/seo.ts` → `scripts/prerender.mjs`):
- `<title>`, description, robots, canonical, hreflang, Open Graph, Twitter Card;
- JSON-LD: `WebSite`, `Person`, `ProfessionalService` з каталогом послуг, `ImageGallery`, `FAQPage` — з тих самих даних, що на сторінці;
- `dist/sitemap.xml` і `dist/robots.txt` з посиланням на sitemap.

Домен задається змінною середовища, а не в коді (див. нижче).
Сторінка пререндерена в HTML, тож пошуковики бачать текст без JS; у кожної секції один `h2`, у сторінки один `h1`.

## Налаштування домену
Домен — одна змінна: **`VITE_SITE_URL`** (повна адреса без слеша в кінці, наприклад `https://korolyk.example`). Вона читається під час збірки (`scripts/prerender.mjs`) і будує canonical, hreflang, `og:url`, sitemap, robots та JSON-LD.

Індексація вмикається лише коли виконані обидві умови: `VITE_SITE_URL` задано **і** `VERCEL_ENV=production`. В усіх інших випадках (preview-гілки, `*.vercel.app` без змінної, локально) збірка має `noindex, nofollow`, `robots.txt` з `Disallow: /`, без sitemap, canonical і `og:url`. Без `VITE_SITE_URL` збірка не падає, а друкує попередження `[seo]`.

**Як підключити домен:**
1. Vercel → Project → Settings → Domains: додати домен і прописати DNS.
2. Vercel → Settings → Environment Variables: `VITE_SITE_URL` = `https://ваш-домен`, середовище **Production** (для Preview не задавати).
3. Зробити Redeploy продакшн-деплою (змінні зчитуються під час збірки, без перезбірки нічого не зміниться).
4. Перевірити `https://ваш-домен/robots.txt` (має бути `Allow: /` і `Sitemap:`) та `view-source` (`index, follow`, canonical на ваш домен), потім додати сайт у Google Search Console й подати `sitemap.xml`.

## Рішення
Принципи стилю описані в `STYLE-LOCK.md`. Нижче технічні рішення, які варто знати.
- **Стек секцій на нативному `position: sticky`.** Скрол веде компоузитор браузера, тому картки не відстають від пальця. JS лише міряє висоту карток на resize (`--stack-top = min(0, vh − h)`) і затемнює нижню картку. Паралакс фото й дрейф hero — CSS scroll-driven animations; браузери без `animation-timeline` показують нерухоме фото.
- **Hero.** Розмитий шар заздалегідь підготовлений і переходить у чітке фото через opacity. Живого `filter: blur` немає.
- **FAQ.** Акордеон розкривається анімацією висоти: це прямо було в брифі. Це єдиний виняток із правила «тільки transform/opacity».
