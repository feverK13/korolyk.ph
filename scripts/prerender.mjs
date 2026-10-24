// Injects server-rendered HTML into dist/index.html so the first paint doesn't wait for JS.
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
// preload the cyrillic faces used above the fold to avoid swap shifts
const critical = [/^inter-cyrillic-wght-normal/, /^unbounded-cyrillic-wght-normal/, /^montserrat-cyrillic-wght-normal/]
const fonts = readdirSync('dist/assets').filter((f) => f.endsWith('.woff2') && critical.some((r) => r.test(f)))
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ')
const html = readFileSync(file, 'utf8')
  .replace('<!--app-html-->', ssr.render())
  // SEO: <title>, meta, canonical, Open Graph, Twitter, JSON-LD — from src/config.ts (seo)
  .replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, ssr.headTags())
  .replace('</head>', `  ${preload}\n  </head>`)
writeFileSync(file, html)
writeFileSync(resolve('dist/sitemap.xml'), ssr.sitemapXml())
writeFileSync(resolve('dist/robots.txt'), ssr.robotsTxt())
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerendered dist/index.html')
