import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-sans-thai/thai-400.css';
import '@fontsource/ibm-plex-sans-thai/thai-500.css';
import '@fontsource/ibm-plex-sans-thai/thai-600.css';
import '@fontsource/ibm-plex-sans-thai/thai-700.css';
import '@fontsource/ibm-plex-sans-thai/latin-400.css';
import '@fontsource/ibm-plex-sans-thai/latin-500.css';
import '@fontsource/ibm-plex-sans-thai/latin-600.css';
import '@fontsource/ibm-plex-sans-thai/latin-700.css';
import './styles/global.css';
import { detectLanguage, initI18n } from './i18n';
import { listenForOtherTabs, useAppStore } from './store/appStore';
import { App } from './app/App';

// Load persisted data first so the saved language wins over the browser language (OMX-024 AC3).
useAppStore.getState().init(detectLanguage());
initI18n(useAppStore.getState().settings.language);
listenForOtherTabs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
