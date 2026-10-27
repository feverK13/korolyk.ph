/**
 * Build-time SEO: <head> tags, JSON-LD, sitemap.xml and robots.txt — all derived from config.ts,
 * so a change of name, city, prices or FAQ updates the markup on the next `npm run build`.
 * Called from scripts/prerender.mjs through entry-server.tsx; nothing here ships to the browser.
 */
import { contacts, faq, person, seo, services, works } from './config'

export type Site = {
  /** адреса сайту без завершального слеша; null, якщо VITE_SITE_URL не задано */
  url: string | null
  /** індексація дозволена лише з доменом І на production-деплої Vercel */
  index: boolean
}

type Env = Record<string, string | undefined>

export function resolveSite(env: Env): Site {
  const raw = env.VITE_SITE_URL?.trim().replace(/\/+$/, '')
  const url = raw || null
  return { url, index: Boolean(url) && env.VERCEL_ENV === 'production' }
}

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const fullName = `${person.firstName} ${person.lastName}`

export function jsonLd(site: Site) {
  const abs = (path: string) => (site.url ? new URL(path, site.url + '/').href : path)
  const url = abs('/')
  const telephone = contacts.phoneHref.replace('tel:', '')
  const address = { '@type': 'PostalAddress', addressLocality: person.city, addressCountry: 'UA' }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: fullName,
        inLanguage: 'uk',
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: fullName,
        jobTitle: 'Fashion photographer',
        url,
        image: abs('/img/anastasia-p01.jpg'),
        telephone,
        sameAs: [contacts.instagramHref],
        address,
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${url}#service`,
        name: `${fullName} — фешн-фотограф`,
        description: seo.description,
        url,
        image: abs(seo.ogImage),
        telephone,
        areaServed: person.cities.map((name) => ({ '@type': 'City', name })),
        address,
        founder: { '@id': `${url}#person` },
        sameAs: [contacts.instagramHref],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Фотозйомки',
          itemListElement: services.map((s) => ({
            '@type': 'Offer',
            priceCurrency: 'UAH',
            ...(s.per
              ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: s.amount, priceCurrency: 'UAH', unitText: s.per } }
              : { price: s.amount }),
            itemOffered: { '@type': 'Service', name: s.title, description: s.desc },
          })),
        },
      },
      {
        '@type': 'ImageGallery',
        '@id': `${url}#works`,
        name: 'Вибрані роботи',
        image: works.map((w) => ({ '@type': 'ImageObject', contentUrl: abs(w.src), name: w.title, description: w.alt })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }
}

export function headTags(site: Site) {
  const abs = (path: string) => (site.url ? new URL(path, site.url + '/').href : path)
  const url = abs('/')
  const image = abs(seo.ogImage)
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${site.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />`,
    // canonical, hreflang and og:url only on an indexable build: a test host never points at (or claims) a real domain
    ...(site.index
      ? [
          `<link rel="canonical" href="${esc(url)}" />`,
          `<link rel="alternate" hreflang="uk" href="${esc(url)}" />`,
          `<link rel="alternate" hreflang="x-default" href="${esc(url)}" />`,
        ]
      : []),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(fullName)}" />`,
    `<meta property="og:locale" content="${esc(seo.locale)}" />`,
    ...(site.index ? [`<meta property="og:url" content="${esc(url)}" />`] : []),
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    // JSON-LD: "<" escaped so a value can never close the script tag
    `<script type="application/ld+json">${JSON.stringify(jsonLd(site)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

export function sitemapXml(site: Site, lastmod = new Date().toISOString().slice(0, 10)) {
  if (!site.index || !site.url) return null
  const abs = (path: string) => new URL(path, site.url + '/').href
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(abs('/'))}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`
}

export function robotsTxt(site: Site) {
  return site.index && site.url
    ? `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site.url + '/').href}
`
    : `User-agent: *
Disallow: /
`
}
