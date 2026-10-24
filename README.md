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

Перед запуском: вписати `seo.siteUrl` (домен), замінити `[ ]`-плейсхолдери, покласти справжнє `public/img/og.jpg` 1200×630. Коли зʼявляться реальні ціни — додати `price` і `priceCurrency: 'UAH'` в `Offer` у `src/seo.ts`. На тестовому домені — `seo.index: false`.
Сторінка пререндерена в HTML, тож пошуковики бачать текст без JS; у кожної секції один `h2`, у сторінки один `h1`.

## Рішення
Принципи стилю описані в `STYLE-LOCK.md`. Нижче технічні рішення, які варто знати.
- **Стек секцій на нативному `position: sticky`.** Скрол веде компоузитор браузера, тому картки не відстають від пальця. JS лише міряє висоту карток на resize (`--stack-top = min(0, vh − h)`) і затемнює нижню картку. Паралакс фото й дрейф hero — CSS scroll-driven animations; браузери без `animation-timeline` показують нерухоме фото.
- **Hero.** Розмитий шар заздалегідь підготовлений і переходить у чітке фото через opacity. Живого `filter: blur` немає.
- **FAQ.** Акордеон розкривається анімацією висоти: це прямо було в брифі. Це єдиний виняток із правила «тільки transform/opacity».
