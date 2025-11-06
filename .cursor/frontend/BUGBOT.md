Frontend Rules: Bugbot Context

Scope: Files within the src/ directory, primarily focused on components, store and contexts (state management), and user experience (UX).

1. Component Design

Use functional React components with Hooks (no class components).

Components must be small, reusable, and follow the Single Responsibility Principle.

Use Tailwind CSS utility classes for styling; inline CSS objects should be avoided.

2. State Management

Prefer React's built-in useState and useContext for local/simple state.

Use a global state library (like Redux or Zustand) only for complex, application-wide state.

3. Accessibility & Responsiveness

All interactive elements (buttons, forms) must be fully accessible (A11y), including appropriate aria- attributes.

The UI must be fully responsive, working seamlessly across mobile, tablet, and desktop breakpoints. Avoid horizontal scrolling.
