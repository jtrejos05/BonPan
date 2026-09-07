import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')

// Prevent double createRoot calls during HMR
if (!container._reactRoot) {
  container._reactRoot = createRoot(container)
}

container._reactRoot.render(
  <StrictMode>
    <App />
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
)
