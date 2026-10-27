import { about, person } from '@/config'
import { Photo, Rise, RevealWords, StackSection, TextLink } from '@/components/primitives'
import { onAnchorClick } from '@/lib/scroll'

/** ∞ is not in the loaded font subsets: drawn as an SVG sized to the digits (cap height ≈ .7em, stroke ≈ weight 800) */
function InfinityMark() {
  return (
    <svg
      role="img"
      aria-label="∞"
      viewBox="0 0 100 50"
      className="inline-block h-[0.52em] w-[1.04em] align-[0.09em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="15"
      strokeLinejoin="round"
    >
      <path d="M50 25C62 6 90 6 90 25C90 44 62 44 50 25C38 6 10 6 10 25C10 44 38 44 50 25Z" />
    </svg>
  )
}

export function About() {
  return (
    <StackSection id="about" tone="paper" labelledBy="about-title" className="sec">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6">
          <RevealWords as="h2" id="about-title" text="про мене" className="t-h2 shrink-0 whitespace-nowrap" />
          <span className="t-meta mute min-w-0 pb-1 text-end">{person.city}</span>
        </div>

        <div className="head-gap grid grid-cols-12 gap-x-4 md:gap-x-6">
          <div className="col-span-5 md:col-span-4 lg:col-span-3 lg:col-start-2">
            <Photo
              src="/img/anastasia-p02.jpg"
              alt={`${person.firstName} в сонцезахисних окулярах тримає туфлі в руці й спирається на двері`}
              ratio={853 / 1280}
              width={853}
              position="38% 25%"
            />
          </div>

          <div className="col-span-7 flex flex-col md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-6">
            <Rise as="p" className="text-[0.8125rem] leading-[1.6] md:text-base md:leading-[1.7]">
              {about.intro}
            </Rise>
            <Rise as="p" delay={0.08} className="mt-4 hidden text-base leading-[1.7] md:block">
              {about.outro}
            </Rise>

            <Rise delay={0.12} className="mt-8 md:mt-12">
              <span className="t-num block">{person.yearsWithCamera === '∞' ? <InfinityMark /> : person.yearsWithCamera}</span>
              <span className="t-meta mt-1 block">років із камерою</span>
            </Rise>
          </div>
        </div>

        <Rise as="p" className="mt-6 text-[0.8125rem] leading-[1.6] md:hidden">
          {about.outro}
        </Rise>

        <div className="mt-10 flex justify-end md:mt-14">
          <TextLink href="#works" onClick={onAnchorClick} className="text-[0.8125rem] md:text-sm">
            портфоліо…
          </TextLink>
        </div>
      </div>
    </StackSection>
  )
}
