import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {initGA} from './utils/analytics.js'

// Инициализация Google Analytics
initGA()

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <App />
  // </StrictMode>,
)
