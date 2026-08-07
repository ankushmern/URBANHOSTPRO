import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFetchInterceptor, ensureCsrfToken } from './utils/api.ts';

initFetchInterceptor();
ensureCsrfToken();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

