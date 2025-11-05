import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import './index.css';
import { routeTree } from './routeTree';
import { TeamProvider } from './contexts/TeamContext';
import { store } from './store';

// Create a query client
const queryClient = new QueryClient();

// Create a router instance
const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <TeamProvider>
          <RouterProvider router={router} />
        </TeamProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>
);
