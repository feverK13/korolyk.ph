import { person } from '@/config'
import { Photo, Rise, RevealWords, StackSection, TextLink } from '@/components/primitives'
import { onAnchorClick } from '@/lib/scroll'

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
            <Photo src="/img/about.webp" alt={`${person.firstName} з камерою`} ratio={3 / 4} width={900} />
          </div>

          <div className="col-span-7 flex flex-col md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-6">
            <Rise as="p" className="text-[0.8125rem] leading-[1.6] md:text-base md:leading-[1.7]">
              Мене звати {person.nameShort}, я фотографую в {person.city} і довкола. Мені цікаві не пози, а паузи між ними: як ви поправляєте волосся, коли думаєте, що кадр уже зроблено.
            </Rise>
            <Rise as="p" delay={0.08} className="mt-4 hidden text-base leading-[1.7] md:block">
              На зйомці я веду, підказую і трохи жартую. Ви не мусите вміти позувати — це моя робота. Ваша — бути собою, навіть якщо спершу ніяково.
            </Rise>

            <Rise delay={0.12} className="mt-8 md:mt-12">
              <span className="t-num block">{person.yearsWithCamera}</span>
              <span className="t-meta mt-1 block">років із камерою</span>
            </Rise>
          </div>
        </div>

        <Rise as="p" className="mt-6 text-[0.8125rem] leading-[1.6] md:hidden">
          На зйомці я веду, підказую і трохи жартую. Ви не мусите вміти позувати — це моя робота. Ваша — бути собою, навіть якщо спершу ніяково.
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
