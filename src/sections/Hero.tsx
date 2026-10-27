import * as React from 'react'
import { m as motion, useReducedMotion } from 'framer-motion'
import { contacts, person } from '@/config'
import { TextLink } from '@/components/primitives'
import { useFitText } from '@/hooks/useFitText'
import { EASE } from '@/lib/utils'
import { onAnchorClick } from '@/lib/scroll'

const line = {
  hidden: { y: '112%' },
  shown: (i: number) => ({ y: '0%', transition: { duration: 1.05, ease: EASE, delay: 0.35 + i * 0.12 } }),
}

export function Hero() {
  const reduce = useReducedMotion()
  const [loaded, setLoaded] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const nameRef = useFitText<HTMLDivElement>(236, 1)
  const sectionRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])


  const first = person.firstName.toLowerCase()
  const last = person.lastName.toLowerCase()
  // long double-barrelled names wrap at the hyphen instead of shrinking the whole line:
  // each hyphen part is its own fit unit
  const parts = (word: string) => word.split(/(?<=-)/)
  const italicAt = Math.min(last.length - 1, 5)

  return (
    <section
      ref={sectionRef}
      id="top"
      data-stack
      aria-labelledby="hero-title"
      className="stack-card on-ink relative bg-ink text-paper"
      style={{ borderRadius: 0 }}
    >
      <div className="wrap @container relative pt-20 md:pt-24 lg:grid lg:min-h-[100svh] lg:grid-cols-12 lg:gap-x-6 lg:pb-10 lg:pt-28">
        {/* Portrait: sharp layer + pre-blurred layer crossfade (no live filter animation) */}
        <div className="relative -mx-[var(--gutter)] lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:mx-0 lg:self-stretch">
          <div className="photo relative aspect-[2/3] md:aspect-[5/4.4] lg:aspect-auto lg:h-full lg:min-h-[640px]">
            {/* gentle drift while leaving the hero: CSS scroll-driven (.hero-drift), compositor thread */}
            <div className="hero-drift absolute inset-0">
            <motion.img
              ref={imgRef}
              src="/img/anastasia-p01.jpg"
              alt={`${person.firstName} ${person.lastName} стоїть на балконі на тлі старих будинків`}
              width={853}
              height={1280}
              fetchPriority="high"
              decoding="async"
              onLoad={() => setLoaded(true)}
              initial={reduce ? false : { scale: 1.06 }}
              animate={loaded ? { scale: 1 } : undefined}
              transition={{ duration: 1.4, ease: EASE }}
              className="absolute inset-0 h-full w-full object-cover object-[50%_36%]"
            />
            </div>
            <motion.img
              src="/img/hero-blur.jpg"
              alt=""
              aria-hidden="true"
              width={36}
              height={54}
              initial={{ opacity: 1 }}
              animate={{ opacity: loaded ? 0 : 1 }}
              transition={{ duration: reduce ? 0 : 0.6, ease: 'easeOut', delay: reduce ? 0 : 0.1 }}
              className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover object-[50%_36%]"
            />
            {/* scrim keeps the white links and name readable over the bright sky and facade */}
            <div aria-hidden="true" className="absolute inset-0 bg-ink/45" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
          </div>

          {/* Ref 2: «works ↘» + small caps links over the photo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute inset-x-0 top-[44%] flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-[var(--gutter)]"
          >
            <TextLink href="#works" onClick={onAnchorClick} arrow className="t-italic text-[1.6rem] font-normal leading-none md:text-[2rem]">
              роботи
            </TextLink>
            <span className="-my-3 flex gap-6 text-[0.6875rem] font-medium uppercase tracking-[0.06em]">
              <a className="inline-flex min-h-11 items-center" href={contacts.instagramHref} target="_blank" rel="noopener noreferrer">
                <span className="u-link">instagram</span>
                <span className="sr-only"> (нова вкладка)</span>
              </a>
            </span>
          </motion.div>
        </div>

        {/* Name: huge light grotesk overlapping the photo, mask reveal line by line */}
        {/* one clean <h1> for search engines and screen readers; the split visual name below is decorative */}
        <div
          ref={nameRef}
          className="t-display pointer-events-none relative z-10 -mt-[0.98em] lg:col-span-12 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:self-end lg:pb-[18vh]"
          style={{ fontSize: 'var(--fit, min(236px, 25cqi))' }}
        >
          <h1 id="hero-title" tabIndex={-1} className="sr-only">
            {person.firstName} {person.lastName} — fashion photographer, {person.city}
          </h1>
          <span aria-hidden="true" className="block">
            <span className="mask-block text-end lg:text-start lg:ps-[0.6em]">
              <motion.span className="inline-block" variants={line} custom={0} initial={reduce ? false : 'hidden'} animate="shown">
                {parts(first).map((p, i) => (
                  <span key={i} className="inline-block" data-fit-line>
                    {p}
                  </span>
                ))}
              </motion.span>
            </span>
            <span className="mask-block relative z-10 -my-[0.04em] ps-[0.12em] text-[max(0.21em,0.8125rem)] font-normal tracking-[-0.03em] leading-[1.1] lg:ps-[0.5em]">
              <motion.span className="inline-block whitespace-nowrap" data-fit-line variants={line} custom={1} initial={reduce ? false : 'hidden'} animate="shown">
                (
                <span className="t-italic italic font-normal">fashion</span>&nbsp;photographer)
              </motion.span>
            </span>
            <span className="mask-block -ms-[0.05em]">
              <motion.span className="inline-block" variants={line} custom={2} initial={reduce ? false : 'hidden'} animate="shown">
                {parts(last).map((p, pi, arr) => {
                  const offset = arr.slice(0, pi).join('').length
                  return (
                    <span key={pi} className="inline-block" data-fit-line>
                      {[...p].map((ch, i) =>
                        offset + i === italicAt ? (
                          <span key={i} className="t-italic italic">
                            {ch}
                          </span>
                        ) : (
                          ch
                        ),
                      )}
                    </span>
                  )
                })}
              </motion.span>
            </span>
          </span>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="relative z-10 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:self-end"
        >
          <p className="ms-auto mt-7 max-w-[30ch] text-[0.8125rem] leading-[1.6] md:text-[0.9375rem] lg:ms-0 lg:mt-0">
            Втілюю естетику моди у персональних лукбуках та світських репортажах. Працюю з глибоким відчуттям стилю, створюючи кадр, що транслює впевненість,&nbsp;статус та&nbsp;енергію образу.
          </p>
        </motion.div>
      </div>

      {/* Ref 1: meta row — city · CTA */}
      <div className="wrap pb-10 pt-12 lg:pb-8 lg:pt-0">
        <div className="t-meta flex items-baseline justify-between gap-4 border-b border-paper/30 pb-2">
          <span className="mute">
            {person.city} · {person.year}
          </span>
          <a href="#contacts" onClick={onAnchorClick} className="u-link">
            звʼязатися…
          </a>
        </div>
      </div>
    </section>
  )
}
