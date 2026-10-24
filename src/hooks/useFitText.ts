import { useLayoutEffect, useRef } from 'react'

/**
 * Scales a display headline so its widest line [data-fit-line] fits the container.
 * Handles any name length (very long/short names) without overflow.
 */
export function useFitText<T extends HTMLElement>(max = 260, fill = 1) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let lastW = -1
    const run = (force = false) => {
      // only re-fit when the available width changes (our own font-size change
      // alters the height and would otherwise retrigger the observer forever)
      if (!force && el.clientWidth === lastW) return
      lastW = el.clientWidth
      const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-fit-line]'))
      if (!lines.length) return
      const avail = el.clientWidth * fill
      // text width scales linearly with font-size → one proportional step, twice for sub-px accuracy
      for (let i = 0; i < 2; i++) {
        const current = parseFloat(getComputedStyle(el).fontSize)
        const widest = Math.max(...lines.map((l) => l.offsetWidth)) // layout width, ignores transforms
        if (!widest || !current) return
        const size = Math.min(max, (current * avail) / widest)
        el.style.setProperty('--fit', `${size.toFixed(2)}px`)
      }
    }
    run(true)
    document.fonts?.ready.then(() => run(true))
    const ro = new ResizeObserver(() => run())
    ro.observe(el)
    return () => ro.disconnect()
  }, [max, fill])
  return ref
}
