import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/inter/wght-italic.css'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource-variable/montserrat/wght.css'
import './index.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// prerendered HTML (see scripts/prerender.mjs) → hydrate; dev → plain render
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
