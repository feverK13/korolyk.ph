import * as React from 'react'
import { contacts, nav } from '@/config'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { scrollToSection } from '@/lib/scroll'

/** Single-line wordmark: korolyk*ph. The asterisk is pulled down from cap height to sit on the x-height line. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-wide whitespace-nowrap font-extrabold lowercase leading-none tracking-[-0.04em] ${className}`} aria-hidden="true">
      korolyk
      <span className="relative top-[0.14em] mx-[0.03em] inline-block">*</span>
      ph
    </span>
  )
}

export function Header() {
  const [open, setOpen] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)

  // hide while scrolling down (frees the content), reveal on scroll up
  React.useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const tick = () => {
      raf = 0
      const y = window.scrollY
      if (Math.abs(y - last) < 6) return
      setHidden(y > last && y > 160)
      last = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // wait for the sheet to close so focus returns, then move
    window.setTimeout(() => scrollToSection(id), 260)
  }

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] text-white mix-blend-difference"
      onFocusCapture={() => setHidden(false)}
    >
      {/* transform lives on an inner layer: animating it on the blend-mode element itself re-blends every frame on iOS */}
      <div
        className="transition-transform duration-500 ease-(--ease-out-soft)"
        style={{ transform: hidden && !open ? 'translateY(-110%)' : undefined }}
      >
      <div className="wrap flex items-start justify-between pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(1.5rem,env(safe-area-inset-top))]">
        <a
          href="#top"
          className="pointer-events-auto -ml-2 inline-flex min-h-12 items-center px-2 text-[0.8rem] md:text-[0.95rem]"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
          }}
        >
          <span className="sr-only">korolyk ph, на початок</span>
          <Logo />
        </a>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="pointer-events-auto -mr-2 grid size-12 place-items-center"
            aria-label="Відкрити меню"
          >
            <span aria-hidden="true" className="flex w-7 flex-col gap-[7px]">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
          </SheetTrigger>
          <SheetContent aria-describedby="menu-desc">
            <div className="wrap flex w-full items-start justify-between pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(1.5rem,env(safe-area-inset-top))]">
              <span className="inline-flex min-h-12 items-center text-[0.8rem] md:text-[0.95rem]">
                <Logo />
              </span>
              <SheetClose className="-mr-2 grid size-12 place-items-center" aria-label="Закрити меню">
                <span aria-hidden="true" className="relative block size-6">
                  <span className="absolute inset-x-0 top-1/2 h-px rotate-45 bg-current" />
                  <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-current" />
                </span>
              </SheetClose>
            </div>
            <SheetTitle className="sr-only">Меню</SheetTitle>
            <SheetDescription id="menu-desc" className="sr-only">
              Розділи сторінки та контакти
            </SheetDescription>
            <nav aria-label="Розділи" className="wrap mt-auto w-full">
              <ol className="m-0 list-none p-0">
                {nav.map((n, i) => (
                  <li key={n.id} className="hairline">
                    <a
                      href={`#${n.id}`}
                      onClick={go(n.id)}
                      className="group flex items-baseline justify-between py-3 md:py-4"
                    >
                      <span className="t-h2 text-[clamp(1.5rem,min(8.5vw,9svh),3.5rem)] transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-x-2 group-active:translate-x-2">
                        {n.label}
                      </span>
                      <span className="t-cap text-mute-ink tabular-nums">{String(i + 1).padStart(2, '0')}/</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="wrap t-meta flex w-full flex-wrap justify-between gap-x-6 gap-y-2 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6">
              <a className="u-link" href={contacts.phoneHref}>{contacts.phone}</a>
              <a className="u-link" href={contacts.instagramHref} target="_blank" rel="noopener noreferrer">instagram</a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      </div>
    </header>
  )
}
