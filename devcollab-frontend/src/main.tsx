import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import useAuthStore from './stores/authStore'
import { setAccessToken } from './utils/authToken'

const finishAuthHydration = () => {
  const { token } = useAuthStore.getState()
  if (token) {
    setAccessToken(token)
  }
  useAuthStore.setState({ _hasHydrated: true })
}

useAuthStore.persist.onFinishHydration(finishAuthHydration)

if (useAuthStore.persist.hasHydrated()) {
  finishAuthHydration()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
