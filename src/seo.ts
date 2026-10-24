/**
 * Build-time SEO: <head> tags, JSON-LD, sitemap.xml and robots.txt — all derived from config.ts,
 * so a change of name, city, prices or FAQ updates the markup on the next `npm run build`.
 * Called from scripts/prerender.mjs through entry-server.tsx; nothing here ships to the browser.
 */
import { contacts, faq, person, seo, services, works } from './config'

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const abs = (path: string) => new URL(path, seo.siteUrl + '/').href
const fullName = `${person.firstName} ${person.lastName}`

export function jsonLd() {
  const url = abs('/')
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
        jobTitle: 'Фотографка',
        url,
        image: abs('/img/hero.webp'),
        telephone: contacts.phone,
        sameAs: [contacts.instagramHref],
        address: { '@type': 'PostalAddress', addressLocality: person.city, addressCountry: 'UA' },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${url}#service`,
        name: `${fullName} — фотографка`,
        description: seo.description,
        url,
        image: abs(seo.ogImage),
        telephone: contacts.phone,
        areaServed: person.city,
        address: { '@type': 'PostalAddress', addressLocality: person.city, addressCountry: 'UA' },
        founder: { '@id': `${url}#person` },
        sameAs: [contacts.instagramHref],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Фотозйомки',
          itemListElement: services.map((s) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: s.title,
              description: `${s.duration}, ${s.photos}, готово ${s.term}`,
            },
            // add "price" + "priceCurrency": "UAH" once real prices replace [ЦІНА]
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

export function headTags() {
  const url = abs('/')
  const image = abs(seo.ogImage)
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${seo.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<link rel="alternate" hreflang="uk" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(fullName)}" />`,
    `<meta property="og:locale" content="${esc(seo.locale)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
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
    `<script type="application/ld+json">${JSON.stringify(jsonLd()).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

export function sitemapXml(lastmod = new Date().toISOString().slice(0, 10)) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(abs('/'))}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`
}

export function robotsTxt() {
  return seo.index ? `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n` : `User-agent: *\nDisallow: /\n`
}
