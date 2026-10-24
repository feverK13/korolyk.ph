import { faq } from '@/config'
import { Rise, SectionHead, StackSection } from '@/components/primitives'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function Faq() {
  return (
    <StackSection id="faq" tone="paper" labelledBy="faq-title" className="sec">
      <SectionHead id="faq-title" title="питання." meta="чесно й коротко" align="left" />
      <div className="wrap md:grid md:grid-cols-12 md:gap-x-6">
        <Accordion type="single" collapsible className="md:col-span-10 md:col-start-3 lg:col-span-8 lg:col-start-5">
          {faq.map((f, i) => (
            <Rise key={f.q} delay={i * 0.05}>
              <AccordionItem value={`q${i}`}>
                <AccordionTrigger className="text-[0.8125rem] font-medium md:text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="mute text-[0.8125rem] leading-[1.65] md:text-[0.9375rem]">{f.a}</AccordionContent>
              </AccordionItem>
            </Rise>
          ))}
        </Accordion>
      </div>
    </StackSection>
  )
}
