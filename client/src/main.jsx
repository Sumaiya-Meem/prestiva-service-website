import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import ErrorBoundary from './components/utils/ErrorBoundary.jsx'
import siteConfig from './config/siteConfig'
import applyOverrides from './config/applyOverrides'
import { setContentOverrides } from './config/content'

const render = () =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )

/**
 * Pull admin-saved config overrides BEFORE first render so prices/text edited
 * in the dashboard show up everywhere. Time-boxed and fully fault-tolerant —
 * if the API is slow or down, we just render with the built-in defaults.
 */
async function boot() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`${siteConfig.apiBaseUrl}/api/settings`, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      if (data && data.settings) {
        // Content resolves via its own store (whole-value replace, so list
        // deletes persist); everything else deep-merges into siteConfig.
        const { content, ...rest } = data.settings
        applyOverrides(siteConfig, rest)
        setContentOverrides(content || {})
      }
    }
  } catch {
    // ignore — defaults are fine
  } finally {
    render()
  }
}

boot()
