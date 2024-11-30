import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<h1>Loading...</h1>}>
    <StrictMode>
      <App />
    </StrictMode>
  </Suspense>,
)
