import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { NotificationContextProvider } from './context/NotificationContext.jsx'
import { SearchContextProvider } from './context/SearchContext.jsx'
import { ProductivityProvider } from './context/ProductivityContext.jsx'
import './utils/productivityDebug.js' // Make debug utility available globally

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <AuthProvider>
        <ProductivityProvider>
          <NotificationContextProvider>
            <SearchContextProvider>
              <App />
            </SearchContextProvider>
          </NotificationContextProvider>
        </ProductivityProvider>
      </AuthProvider>
    </AppProvider>
  </StrictMode>,
)
