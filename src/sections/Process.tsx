import { steps } from '@/config'
import { Rise, RevealWords, StackSection } from '@/components/primitives'

export function Process() {
  return (
    <StackSection id="process" tone="ink" labelledBy="process-title" className="sec">
      <div className="wrap">
        <div className="relative w-fit">
          <RevealWords as="h2" id="process-title" text="як це буде" italic={[4]} className="t-light" />
          <span className="t-italic absolute end-0 top-full -mt-1 text-[1rem] font-normal md:text-[1.5rem]" aria-hidden="true">
            (зйомка)
          </span>
        </div>

        <ol className="head-gap-sfx grid list-none gap-0 p-0 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Rise as="li" key={s.n} delay={i * 0.08} className="hairline grid grid-cols-12 gap-x-4 py-6 md:block md:py-8">
              <span className="t-num col-span-4 text-[clamp(1.75rem,7vw,3rem)]" aria-hidden="true">{s.n}</span>
              <div className="col-span-8 md:mt-10">
                <h3 className="text-[0.9375rem] font-semibold lowercase md:text-lg">{s.title}</h3>
                <p className="mute mt-2 text-[0.8125rem] leading-[1.6] md:text-[0.9375rem]">{s.text}</p>
              </div>
            </Rise>
          ))}
        </ol>
      </div>
    </StackSection>
  )
}
