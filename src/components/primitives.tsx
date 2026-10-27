import * as React from 'react'
import { m as motion, type Variants } from 'framer-motion'
import { cn, EASE } from '@/lib/utils'

/* ───────────────── Reveal words (mask + stagger), deterministic italic letters ───────────────── */

const wordVariants: Variants = {
  hidden: { y: '108%' },
  shown: { y: '0%', transition: { duration: 0.9, ease: EASE } },
}

type RevealProps = {
  text: string
  /** indices (in the full string, spaces included) of letters set in italic */
  italic?: number[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  stagger?: number
  id?: string
}

export function RevealWords({ text, italic = [], as = 'h2', className, delay = 0, stagger = 0.08, id }: RevealProps) {
  const Tag = motion[as]
  const words = text.split(' ')
  const starts = words.map((_, i) => words.slice(0, i).join(' ').length + (i ? 1 : 0))
  return (
    <Tag
      id={id}
      aria-label={text}
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {/* text stays one readable string for crawlers; aria-label keeps letter spans from being spelled out */}
      <span>
        {words.map((w, wi) => {
          const start = starts[wi]
          return (
            <React.Fragment key={wi}>
              <span className="mask">
                <motion.span className="inline-block" variants={wordVariants}>
                  {[...w].map((ch, ci) =>
                    italic.includes(start + ci) ? (
                      <span key={ci} className="t-italic italic tracking-[-0.02em]">
                        {ch}
                      </span>
                    ) : (
                      <React.Fragment key={ci}>{ch}</React.Fragment>
                    ),
                  )}
                </motion.span>
              </span>
              {wi < words.length - 1 ? ' ' : null}
            </React.Fragment>
          )
        })}
      </span>
    </Tag>
  )
}

/* ───────────────── Fade/rise on view (used for blocks & form fields) ───────────────── */

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function Rise({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'p' | 'li' | 'ul'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
      variants={riseItem}
      transition={{ delay }}
    >
      {children}
    </Tag>
  )
}

/* ───────────────── Photo with parallax, reveal and indexed caption ───────────────── */

type PhotoProps = {
  src: string
  alt: string
  ratio: number
  className?: string
  caption?: { title: string; index?: string }
  sizes?: string
  eager?: boolean
  parallax?: boolean
  width?: number
  /** real pixel height of the file (defaults to width / ratio) */
  height?: number
  /** CSS object-position for the cover crop, e.g. '50% 25%' (keeps the face in frame) */
  position?: string
}

export function Photo({ src, alt, ratio, className, caption, eager, parallax = true, width = 1200, height, position }: PhotoProps) {

  return (
    <motion.figure
      className={cn('m-0', className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div
        className="photo"
        style={{ aspectRatio: String(ratio) }}
        variants={{
          hidden: { opacity: 0, y: 28 },
          shown: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
        }}
      >
        {/* parallax: CSS scroll-driven animation (.photo-par) — runs on the compositor,
            same mapping as before: translateY -7% → 7% over the frame's cover range, scale 1.16 */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height ?? Math.round(width / ratio)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={parallax ? 'photo-par' : undefined}
          style={position ? { objectPosition: position } : undefined}
        />
      </motion.div>
      {caption ? (
        <motion.figcaption
          className="t-cap mt-2.5 flex items-baseline justify-between gap-4"
          variants={{
            hidden: { opacity: 0, y: 6 },
            shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.35 } },
          }}
        >
          <span className="min-w-0">{caption.title}</span>
          {caption.index ? (
            <span className="mute shrink-0 whitespace-nowrap tabular-nums">
              <span className="sr-only">кадри </span>
              {caption.index}
            </span>
          ) : null}
        </motion.figcaption>
      ) : null}
    </motion.figure>
  )
}

/* ───────────────── Links ───────────────── */

export function TextLink({
  href,
  children,
  arrow,
  className,
  external,
  onClick,
}: {
  href: string
  children: React.ReactNode
  arrow?: boolean
  className?: string
  external?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn('u-link', className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {arrow ? (
        <span className="arrow" aria-hidden="true">
          ↘
        </span>
      ) : null}
      {external ? <span className="sr-only"> (відкриється в новій вкладці)</span> : null}
    </a>
  )
}

/* ───────────────── Section header row (Ref 1): meta · title · hairline ───────────────── */

export function SectionHead({
  meta,
  title,
  id,
  align = 'right',
  className,
}: {
  meta?: React.ReactNode
  title: string
  id: string
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <div className={cn('wrap', className)}>
      {/* DOM order follows visual order (no row-reverse) */}
      <div className="flex items-end justify-between gap-6 pb-3">
        {align === 'right' ? <span className="t-meta mute pb-1">{meta}</span> : null}
        <RevealWords as="h2" id={id} text={title} className="t-h2" stagger={0.06} />
        {align === 'left' ? <span className="t-meta mute pb-1 text-end">{meta}</span> : null}
      </div>
      <div className="hairline" />
    </div>
  )
}

/* ───────────────── Stack card section ───────────────── */

export function StackSection({
  id,
  tone,
  children,
  className,
  labelledBy,
}: {
  id: string
  tone: 'ink' | 'paper'
  children: React.ReactNode
  className?: string
  labelledBy?: string
}) {
  return (
    <section
      id={id}
      data-stack
      aria-labelledby={labelledBy}
      className={cn(
        'stack-card',
        tone === 'ink' ? 'on-ink bg-ink text-paper' : 'bg-paper text-ink',
        className,
      )}
    >
      {children}
      <div className="stack-dim" aria-hidden="true" />
    </section>
  )
}
