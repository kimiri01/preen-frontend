import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from '@/App'
import { queryClient } from '@/common/query/queryClient'
import '@/common/styles/global.css'
import { ToastProvider } from './features/reservation/public'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </ToastProvider>
  </StrictMode>,
)
