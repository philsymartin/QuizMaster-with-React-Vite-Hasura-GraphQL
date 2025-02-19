import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Providers from './routes/Providers';
import App from './App';

const rootElement = document.getElementById("root") as HTMLElement;
createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);