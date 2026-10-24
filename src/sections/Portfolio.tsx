import { contacts, works } from '@/config'
import { Photo, Rise, RevealWords, StackSection, TextLink } from '@/components/primitives'

export function Portfolio() {
  // the layout has five slots; any of them may be empty (fewer works in config) without breaking the page
  type Work = { src: string; alt: string; ratio: number; title: string; index: string; note?: string }
  const [w1, w2, w3, w4, w5] = works as readonly Work[] as (Work | undefined)[]
  if (!w1) return null
  return (
    <StackSection id="works" tone="ink" labelledBy="works-title" className="sec">
      <div className="wrap">
        {/* Ref 2: «featured (works)» */}
        <div className="relative w-fit">
          <RevealWords as="h2" id="works-title" text="вибране" italic={[4]} className="t-light" />
          <span className="t-italic absolute end-0 top-full -mt-1 text-[1rem] font-normal md:text-[1.5rem]" aria-hidden="true">
            (роботи)
          </span>
        </div>

        <div className="head-gap-sfx grid grid-cols-12 gap-x-4 gap-y-14 md:gap-x-6 md:gap-y-24">
          {/* 1 — small square left, note right-bottom */}
          <div className="col-span-6 md:col-span-4 lg:col-span-3 lg:col-start-2">
            <Photo src={w1.src} alt={w1.alt} ratio={w1.ratio} caption={{ title: w1.title, index: w1.index }} width={1000} />
          </div>
          {w1.note ? (
            <Rise as="p" className="t-cap col-span-6 self-end pb-8 text-mute-ink md:col-span-4 md:text-sm lg:col-span-3">
              {w1.note}
            </Rise>
          ) : null}

          {/* 2 — wide */}
          {w2 ? (
          <div className="col-span-12 md:col-span-9 md:col-start-3 lg:col-span-7 lg:col-start-6">
            <Photo src={w2.src} alt={w2.alt} ratio={w2.ratio} caption={{ title: w2.title, index: w2.index }} width={1500} />
          </div>
          ) : null}

          {/* 3 — panoramic shifted right */}
          {w3 ? (
          <div className="col-span-9 col-start-4 md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-2">
            <Photo src={w3.src} alt={w3.alt} ratio={w3.ratio} caption={{ title: w3.title, index: w3.index }} width={1400} />
          </div>
          ) : null}

          {/* 4 — portrait left + text right-top */}
          {w4 ? (
          <div className="col-span-6 md:col-span-5 lg:col-span-4 lg:col-start-7">
            <Photo src={w4.src} alt={w4.alt} ratio={w4.ratio} caption={{ title: w4.title, index: w4.index }} width={900} />
          </div>
          ) : null}
          {w4?.note ? (
            <Rise as="p" className="t-cap col-span-6 text-mute-ink md:col-span-4 md:col-start-8 md:text-sm lg:col-span-2 lg:col-start-11">
              {w4.note}
            </Rise>
          ) : null}

          {/* 5 — more projects + small portrait right */}
          <div className="col-span-7 self-end pb-8 md:col-span-6 lg:col-span-5 lg:col-start-2">
            <TextLink
              href={contacts.instagramHref}
              external
              className="t-italic text-[1.75rem] leading-[1.05] md:text-[2.75rem]"
            >
              <span>
                більше
                <br />
                проєктів <span className="arrow not-italic" aria-hidden="true">↘</span>
                <span className="mt-1 block font-sans text-[0.8125rem] not-italic font-medium md:text-sm">в Instagram</span>
              </span>
            </TextLink>
          </div>
          {w5 ? (
          <div className="col-span-5 md:col-span-4 md:col-start-9 lg:col-span-3 lg:col-start-9">
            <Photo src={w5.src} alt={w5.alt} ratio={w5.ratio} caption={{ title: w5.title, index: w5.index }} width={800} />
          </div>
          ) : null}
        </div>
      </div>
    </StackSection>
  )
}
