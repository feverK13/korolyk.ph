import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { onAnchorClick } from "@/lib/scroll"
import { Header } from '@/components/Header'
import { useStack } from '@/hooks/useStack'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Portfolio } from '@/sections/Portfolio'
import { Services } from '@/sections/Services'
import { Process } from '@/sections/Process'
import { Faq } from '@/sections/Faq'
import { Contacts } from '@/sections/Contacts'

export default function App() {
  useStack()
  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <a href="#contacts" onClick={onAnchorClick} className="sr-only-focusable fixed left-4 top-4 z-[100] bg-paper px-4 py-3 text-ink">
        Перейти до контактів
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Services />
        <Process />
        <Faq />
        <Contacts />
      </main>
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
    </LazyMotion>
  )
}
