import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import { initializeDatabase } from './services/database'
import './index.css'

// Initialize database before rendering
initializeDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to initialize app:', error)
  document.body.innerHTML = '<h1>Failed to initialize application</h1>'
})
