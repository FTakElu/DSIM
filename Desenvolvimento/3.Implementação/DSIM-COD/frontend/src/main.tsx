import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './index.css';
// import './service/mockAPI'; // ⚠️ DESABILITADO - Usando API real (Backend Node.js)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
      <App />
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>,
)