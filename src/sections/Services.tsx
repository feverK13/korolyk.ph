import { person, services } from '@/config'
import { Photo, Rise, SectionHead, StackSection } from '@/components/primitives'
import { onAnchorClick } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const photo = (s: (typeof services)[number]) => (
  <div className="col-span-6 md:col-span-5 lg:col-span-6">
    <Photo src={s.img} alt={`Приклад зйомки: ${s.title}`} ratio={853 / 1280} width={853} height={1280} />
  </div>
)

export function Services() {
  return (
    <StackSection id="services" tone="paper" labelledBy="services-title" className="sec">
      <SectionHead id="services-title" title="послуги" meta={person.year} />

      <ol className="wrap head-gap grid list-none gap-y-16 md:gap-y-20 lg:grid-cols-2 lg:gap-x-24">
        {services.map((s, i) => {
          const flip = i % 2 === 1
          return (
            <li key={s.n} className={cn('grid grid-cols-12 gap-x-4', flip && 'lg:mt-40')}>
              {/* DOM order = visual order: flipped cards render the photo first */}
              {flip ? photo(s) : null}
              <div className={cn('col-span-6 flex flex-col md:col-span-7 lg:col-span-6', flip && 'md:ps-4 lg:ps-0')}>
                <span className="t-num" aria-hidden="true">{s.n}</span>
                <div className="mt-auto pt-6">
                  <h3 className="text-[0.9375rem] font-semibold lowercase leading-tight md:text-lg">
                    <span className="sr-only">{i + 1}. </span>
                    {s.title}
                  </h3>
                  <dl className="t-cap mute mt-2 grid gap-0.5 md:text-[0.8125rem]">
                    <div className="flex gap-1"><dt className="sr-only">тривалість</dt><dd className="m-0">{s.duration}</dd></div>
                    <div className="flex gap-1"><dt className="sr-only">кількість фото</dt><dd className="m-0">{s.photos}</dd></div>
                    <div className="flex gap-1"><dt className="sr-only">термін готовності</dt><dd className="m-0">готово {s.term}</dd></div>
                  </dl>
                  <p className="mt-3 text-[0.8125rem] font-semibold md:text-sm">
                    <span className="border-b border-current pb-0.5">{s.price}</span>
                  </p>
                </div>
              </div>
              {flip ? null : photo(s)}
              <Rise as="p" className="mute col-span-12 mt-5 max-w-[52ch] text-[0.8125rem] leading-[1.6] md:text-[0.9375rem]">
                {s.desc}
              </Rise>
              <Rise className={cn('col-span-12 mt-3 flex', flip ? 'justify-start' : 'justify-end')}>
                <a
                  href="#contacts"
                  onClick={onAnchorClick}
                  className="group -my-2 flex min-h-11 items-center text-[0.8125rem] md:text-sm"
                >
                  <span className="u-link">обговорити «{s.title}»…</span>
                </a>
              </Rise>
            </li>
          )
        })}
      </ol>
    </StackSection>
  )
}
