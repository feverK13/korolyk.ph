import { contacts, person } from '@/config'
import { Photo, SectionHead, StackSection } from '@/components/primitives'

export function Contacts() {
  const links = [
    { label: 'телефон', value: contacts.phone, href: contacts.phoneHref, external: false },
    { label: 'instagram', value: contacts.instagram, href: contacts.instagramHref, external: true },
  ]
  return (
    <StackSection id="contacts" tone="ink" labelledBy="contacts-title" className="pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[var(--sec-top)]">
      <div className="wrap md:grid md:grid-cols-12 md:gap-x-6 lg:items-stretch">
        <div className="md:col-span-7 lg:col-span-5">
          <Photo src="/img/contact.webp" alt={`${person.firstName} ${person.lastName}, портрет`} ratio={4 / 5} width={1200} />
        </div>
        <div className="mt-12 flex flex-col md:col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-0">
          <SectionHead id="contacts-title" title="контакти" meta={person.year} className="!mx-0 w-full !px-0" />
          <ul className="m-0 list-none p-0">
            {links.map((l) => (
              <li key={l.label} className="border-b border-paper/30">
                <a
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 py-3"
                >
                  <span className="t-meta mute">{l.label}</span>
                  <span className="text-end text-[1.05rem] font-medium [overflow-wrap:anywhere] md:text-xl">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-bottom bg-no-repeat pb-0.5">
                      {/* long handles break after . _ instead of mid-word */}
                      {l.value.split(/(?<=[._])/).map((part, i) => (
                        <span key={i}>
                          {i ? <wbr /> : null}
                          {part}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span aria-hidden="true" className="transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-x-1 group-hover:translate-y-1 group-active:translate-x-1 group-active:translate-y-1">↘</span>
                  {l.external ? <span className="sr-only"> (нова вкладка)</span> : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="mute mt-8 max-w-[36ch] text-[0.8125rem] leading-relaxed">
            Пишіть як зручно — відповідаю всюди однаково швидко. Знімаю в {person.city} та області, виїзд в інші міста — за домовленістю.
          </p>

          <footer className="t-cap mute mt-auto flex items-baseline justify-between gap-4 pt-16">
            <span className="min-w-0">
              © {person.year} {person.firstName} {person.lastName}
            </span>
            <a
              href="#top"
              className="u-link shrink-0 whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
                document.getElementById('hero-title')?.focus()
              }}
            >
              нагору ↑
            </a>
          </footer>
        </div>
      </div>
    </StackSection>
  )
}
