import type * as React from 'react'

/**
 * Sticky (stacked) sections report their *stuck* position, so native anchor
 * scrolling can land wrong. Compute each section's normal-flow position instead.
 */
export function scrollToSection(id: string, focus = true) {
  const target = document.getElementById(id)
  if (!target) return
  const parent = target.parentElement!
  const sections = Array.from(parent.children) as HTMLElement[]
  let y = parent.getBoundingClientRect().top + window.scrollY
  for (const s of sections) {
    if (s === target) break
    const mt = parseFloat(getComputedStyle(s).marginTop) || 0
    y += s.offsetHeight + mt
  }
  y += parseFloat(getComputedStyle(target).marginTop) || 0
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' })
  if (focus) {
    const heading = target.querySelector<HTMLElement>('h2, h1')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }
  history.replaceState(null, '', `#${id}`)
}

export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href')
  if (!href?.startsWith('#')) return
  e.preventDefault()
  scrollToSection(href.slice(1))
}
