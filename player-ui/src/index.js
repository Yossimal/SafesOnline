import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppContextProvider from './context/auth-context/auth-context.js'







const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <AppContextProvider>
      <App/>
    </AppContextProvider>
  // </React.StrictMode>
);



reportWebVitals();
