// Injects server-rendered HTML into dist/index.html so the first paint doesn't wait for JS.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
// domain = one variable: VITE_SITE_URL. Indexing needs the domain AND a Vercel production deploy.
const site = ssr.resolveSite(process.env)
if (!site.url) {
  console.warn('[seo] VITE_SITE_URL is not set: building with noindex, no canonical and no sitemap. Set it (https://your-domain, no trailing slash) in Vercel → Settings → Environment Variables and redeploy.')
} else if (!site.index) {
  console.warn(`[seo] VERCEL_ENV=${process.env.VERCEL_ENV ?? '(unset)'}: not a production deploy, so this build is noindex (VITE_SITE_URL=${site.url}).`)
}
// preload the cyrillic faces used above the fold to avoid swap shifts
const critical = [/^inter-cyrillic-wght-normal/, /^unbounded-cyrillic-wght-normal/, /^montserrat-cyrillic-wght-normal/]
const fonts = readdirSync('dist/assets').filter((f) => f.endsWith('.woff2') && critical.some((r) => r.test(f)))
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ')
const html = readFileSync(file, 'utf8')
  .replace('<!--app-html-->', ssr.render())
  // SEO: <title>, meta, canonical, Open Graph, Twitter, JSON-LD — from src/config.ts (seo)
  .replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, ssr.headTags(site))
  .replace('</head>', `  ${preload}\n  </head>`)
writeFileSync(file, html)
const sitemap = ssr.sitemapXml(site)
const sitemapFile = resolve('dist/sitemap.xml')
if (sitemap) writeFileSync(sitemapFile, sitemap)
else if (existsSync(sitemapFile)) rmSync(sitemapFile)
writeFileSync(resolve('dist/robots.txt'), ssr.robotsTxt(site))
// 404 page in the site's own tokens: reuses the built stylesheet (and so the self-hosted fonts); Vercel serves dist/404.html for unknown paths
const css = html.match(/<link rel="stylesheet"[^>]*>/)?.[0] ?? ''
writeFileSync(
  resolve('dist/404.html'),
  `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Сторінку не знайдено</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#0b0b0b" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${css}
  </head>
  <body style="margin:0;min-height:100svh;display:grid;place-items:center;padding:20px;background:var(--color-ink,#0b0b0b);color:var(--color-paper,#f2f2f0)">
    <main style="max-width:36rem">
      <p style="margin:0;font-family:var(--font-wide);font-weight:800;font-size:clamp(1.9rem,8vw,4rem);letter-spacing:-0.04em;line-height:1">404</p>
      <h1 style="margin:1.5rem 0 0;font-family:var(--font-display);font-weight:300;font-size:clamp(1.75rem,7.4vw,4.25rem);letter-spacing:-0.045em;line-height:0.95">Сторінку не знайдено</h1>
      <p style="margin:1.5rem 0 0;font-size:0.875rem"><a href="/" style="color:inherit;text-underline-offset:0.25em">на головну</a></p>
    </main>
  </body>
</html>
`,
)
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerendered dist/index.html')
