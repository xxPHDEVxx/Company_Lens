import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable MSW in development - DISABLED to use real backend
async function enableMocking() {
  // MSW disabled - using real Django backend
  return Promise.resolve();
}

// Direct rendering without MSW
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
) 