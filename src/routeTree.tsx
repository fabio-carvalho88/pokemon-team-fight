import { createRootRoute, createRoute } from '@tanstack/react-router';
import Root from './routes/__root';
import Index from './routes/index';
import Teams from './routes/teams';
import Battle from './routes/battle';

const rootRoute = createRootRoute({
  component: Root
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index
});

const teamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teams',
  component: Teams
});

const battleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/battle',
  component: Battle
});

export const routeTree = rootRoute.addChildren([indexRoute, teamsRoute, battleRoute]);
