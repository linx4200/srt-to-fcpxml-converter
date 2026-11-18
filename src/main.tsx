import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { initializeAnalytics } from './utils/analytics';
import App from './App.tsx';
import './index.css';
import { I18nProvider } from './i18n.tsx';

initializeAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
