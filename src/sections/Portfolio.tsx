import { contacts, works } from '@/config'
import { Photo, Rise, RevealWords, StackSection, TextLink } from '@/components/primitives'

export function Portfolio() {
  // the layout has five slots; any of them may be empty (fewer works in config) without breaking the page
  type Work = { src: string; alt: string; w: number; h: number; title: string; index: string; note?: string }
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
            <Photo src={w1.src} alt={w1.alt} ratio={w1.w / w1.h} caption={{ title: w1.title, index: w1.index }} width={w1.w} height={w1.h} />
          </div>
          {w1.note ? (
            <Rise as="p" className="t-cap col-span-6 self-end pb-8 text-mute-ink md:col-span-4 md:text-sm lg:col-span-3">
              {w1.note}
            </Rise>
          ) : null}

          {/* 2 — wide */}
          {w2 ? (
          <div className="col-span-10 col-start-3 md:col-span-7 md:col-start-5 lg:col-span-5 lg:col-start-7">
            <Photo src={w2.src} alt={w2.alt} ratio={w2.w / w2.h} caption={{ title: w2.title, index: w2.index }} width={w2.w} height={w2.h} />
          </div>
          ) : null}

          {/* 3 — panoramic shifted right */}
          {w3 ? (
          <div className="col-span-7 md:col-span-5 md:col-start-2 lg:col-span-4 lg:col-start-2">
            <Photo src={w3.src} alt={w3.alt} ratio={w3.w / w3.h} caption={{ title: w3.title, index: w3.index }} width={w3.w} height={w3.h} />
          </div>
          ) : null}

          {/* 4 — portrait left + text right-top */}
          {w4 ? (
          <div className="col-span-6 md:col-span-5 lg:col-span-4 lg:col-start-7">
            <Photo src={w4.src} alt={w4.alt} ratio={w4.w / w4.h} caption={{ title: w4.title, index: w4.index }} width={w4.w} height={w4.h} />
          </div>
          ) : null}
          {w4?.note ? (
            <Rise as="p" className="t-cap col-span-6 text-mute-ink md:col-span-4 md:col-start-8 md:text-sm lg:col-span-2 lg:col-start-11">
              {w4.note}
            </Rise>
          ) : null}

          {/* 5 — more projects + small portrait right */}
          <div className="col-span-12 -mb-10 flex flex-col items-start justify-end gap-8 pb-0 md:mb-0 md:col-span-6 md:pb-8 lg:col-span-5 lg:col-start-2">
            {w5?.note ? (
              <Rise as="p" className="t-cap order-2 max-w-[28ch] text-mute-ink md:order-1 md:text-sm">
                {w5.note}
              </Rise>
            ) : null}
            <TextLink
              href={contacts.instagramHref}
              external
              className="t-italic order-1 text-[1.75rem] leading-[1.05] md:order-2 md:text-[2.75rem]"
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
          <div className="col-span-9 col-start-4 md:col-span-4 md:col-start-9 lg:col-span-4 lg:col-start-8">
            <Photo src={w5.src} alt={w5.alt} ratio={w5.w / w5.h} caption={{ title: w5.title, index: w5.index }} width={w5.w} height={w5.h} />
          </div>
          ) : null}
        </div>
      </div>
    </StackSection>
  )
}
