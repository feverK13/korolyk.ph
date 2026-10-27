// Post-build SEO check: node --experimental-strip-types scripts/check-seo.mjs  (after `npm run build`)
// Verifies JSON-LD in dist/index.html is valid and matches src/config.ts, plus heading structure and head tags.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { person, contacts, services, faq, works, seo, nav } = await import(pathToFileURL(resolve('src/config.ts')).href)
const html = readFileSync('dist/index.html', 'utf8')
const errors = []
const ok = (cond, msg) => { if (!cond) errors.push(msg) }

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
ok(blocks.length === 1, `expected 1 JSON-LD block, got ${blocks.length}`)
let ld
try { ld = JSON.parse(blocks[0][1]) } catch (e) { errors.push('JSON-LD is not valid JSON: ' + e.message) }
if (ld) {
  ok(ld['@context'] === 'https://schema.org', '@context')
  const g = Object.fromEntries(ld['@graph'].map((n) => [n['@type'], n]))
  for (const t of ['WebSite', 'Person', 'ProfessionalService', 'ImageGallery', 'FAQPage']) ok(g[t], `missing ${t}`)
  const tel = contacts.phoneHref.replace('tel:', '')
  ok(g.Person.name === `${person.firstName} ${person.lastName}`, 'Person.name')
  ok(g.Person.telephone === tel && g.ProfessionalService.telephone === tel, 'telephone')
  ok(JSON.stringify(g.Person.sameAs) === JSON.stringify([contacts.instagramHref]), 'sameAs')
  ok(JSON.stringify(g.ProfessionalService.areaServed.map((a) => a.name)) === JSON.stringify(person.cities), 'areaServed')
  ok(!g.Person.address.streetAddress, 'no street address may be invented')
  const offers = g.ProfessionalService.hasOfferCatalog.itemListElement
  ok(offers.length === services.length, 'offer count')
  services.forEach((s, i) => {
    const o = offers[i]
    ok(o.itemOffered.name === s.title && o.itemOffered.description === s.desc, `service text ${s.title}`)
    const price = o.priceSpecification?.price ?? o.price
    ok(price === s.amount && o.priceCurrency === 'UAH', `price ${s.title}`)
    ok((o.priceSpecification?.unitText ?? undefined) === s.per, `unit ${s.title}`)
    ok(html.includes(s.title) && html.includes(s.desc), `service not visible on page: ${s.title}`)
  })
  const qs = g.FAQPage.mainEntity
  ok(qs.length === faq.length, 'faq count')
  faq.forEach((f, i) => ok(qs[i].name === f.q && qs[i].acceptedAnswer.text === f.a && html.includes(f.a), `faq ${f.q}`))
  ok(!qs.some((q) => /соромлюсь/.test(q.name)), 'removed FAQ item is still in JSON-LD')
  ok(g.ImageGallery.image.length === works.length, 'gallery count')
  works.forEach((w, i) => ok(g.ImageGallery.image[i].description === w.alt && html.includes(`alt="${w.alt}"`), `gallery alt ${w.src}`))
}

const h1 = (html.match(/<h1[\s>]/g) || []).length
ok(h1 === 1, `h1 count ${h1}`)
for (const n of nav.filter((n) => n.id !== 'works').concat([{ id: 'works' }])) {
  const sec = html.match(new RegExp(`<section[^>]*id="${n.id}"[\\s\\S]*?</section>`))
  ok(sec, `section ${n.id}`)
  if (sec) ok((sec[0].match(/<h2[\s>]/g) || []).length === 1, `h2 count in #${n.id}`)
}
ok(html.includes('<html lang="uk"'), 'lang uk')
ok(seo.title.length <= 60, `title ${seo.title.length} chars`)
ok(seo.description.length <= 155, `description ${seo.description.length} chars`)
ok(/<meta name="robots"/.test(html), 'robots meta')
ok(/<meta property="og:image:width" content="1200"/.test(html), 'og size')
for (const bad of ['[ЦІНА]', '[ТЕЛЕФОН]', '[Місто]', 'TODO', 'your-domain', 'example.com']) ok(!html.includes(bad), `placeholder "${bad}" in dist/index.html`)

if (errors.length) { console.error('SEO check FAILED:\n- ' + errors.join('\n- ')); process.exit(1) }
console.log(`SEO check OK: JSON-LD (${ld['@graph'].length} nodes) matches config; h1=${h1}; title ${seo.title.length}, description ${seo.description.length} chars`)
