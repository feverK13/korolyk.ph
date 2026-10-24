import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// build-time SEO generators, used by scripts/prerender.mjs
export { headTags, sitemapXml, robotsTxt } from './seo'
