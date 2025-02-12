import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Providers from './routes/Providers';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}