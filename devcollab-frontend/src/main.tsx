import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import useAuthStore from './stores/authStore'
import { setAccessToken } from './utils/authToken'

const finishAuthHydration = () => {
  const { token } = (useAuthStore as any).getState()
  if (token) {
    setAccessToken(token)
  }
  (useAuthStore as any).setState({ _hasHydrated: true })
}

(useAuthStore as any).persist.onFinishHydration(finishAuthHydration)

if ((useAuthStore as any).persist.hasHydrated()) {
  finishAuthHydration()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
