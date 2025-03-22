import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import ClerkUserProvider from './components/ClerkUserProvider'

// Get Clerk publishable key from environment variable
// In development, you can hardcode this for testing
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGVzaXJlZC1wYW50aGVyLTY4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Using a placeholder key for testing

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing Clerk Publishable Key. Authentication may not work.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined
      }}
    >
      <BrowserRouter>
        <ClerkUserProvider>
          <App />
        </ClerkUserProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
