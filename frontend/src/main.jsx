import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import { GeistProvider, CssBaseline, Button } from "@geist-ui/react";

createRoot(document.getElementById('root')).render(
  <GeistProvider>
    <CssBaseline />
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
  </GeistProvider>
)
