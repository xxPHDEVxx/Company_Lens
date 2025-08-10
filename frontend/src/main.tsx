import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable MSW in development
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: (req, print) => {
      if (req.url.includes('/api/')) {
        console.error('⚠️ Unhandled API request:', req.method, req.url);
        print.warning();
      }
    },
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })
}

enableMocking().then(() => {
  console.log('✅ MSW initialized successfully');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  )
}).catch((error) => {
  console.error('❌ Failed to initialize MSW:', error);
  // Failed to initialize MSW - still render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  )
}) 