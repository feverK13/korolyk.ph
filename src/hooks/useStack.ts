import { useEffect } from 'react'

/**
 * Card stack on native `position: sticky` (see .stack-card in index.css).
 *
 * The browser's compositor scrolls sticky cards, so they never lag behind a finger
 * or a momentum fling the way JS counter-scrolling (translateY on scroll) does.
 *
 * This hook only:
 *  - measures each card on resize and sets --stack-top = min(0, vh − height):
 *    a card shorter than the viewport sticks at its top edge, a taller one first
 *    scrolls through and sticks at its bottom edge — so a card is never covered
 *    before its content has been on screen;
 *  - dims the card underneath while the next one slides over (opacity only, rAF).
 */
export function useStack(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-stack]'))
    if (sections.length < 2) return
    const dims = sections.map((s) => s.querySelector<HTMLElement>(':scope > .stack-dim'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const lastDim: number[] = sections.map(() => -1)
    let vh = window.innerHeight
    let frame = 0

    sections.forEach((s, i) => {
      s.style.zIndex = String(i + 1)
    })

    const measure = () => {
      vh = window.innerHeight
      for (const s of sections) {
        const top = `${Math.min(0, vh - s.offsetHeight)}px`
        if (s.style.getPropertyValue('--stack-top') !== top) s.style.setProperty('--stack-top', top)
      }
      update()
    }

    const update = () => {
      frame = 0
      for (let i = 0; i < sections.length - 1; i++) {
        // the next card scrolls normally until it sticks, so its rect is its real position
        const nextTop = sections[i + 1].getBoundingClientRect().top
        const p = Math.min(1, Math.max(0, (1 - nextTop / vh - 0.2) / 0.8))
        const dim = reduce.matches ? 0 : Math.round(p * 0.55 * 1000) / 1000
        if (dim !== lastDim[i]) {
          lastDim[i] = dim
          const d = dims[i]
          if (d) d.style.opacity = String(dim)
        }
      }
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    let resizeT = 0
    const onResize = () => {
      window.clearTimeout(resizeT)
      resizeT = window.setTimeout(measure, 80)
    }
    const ro = new ResizeObserver(onResize)
    sections.forEach((s) => ro.observe(s))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeT)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])
}
