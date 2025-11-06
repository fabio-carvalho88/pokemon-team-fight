Global Project Rules: Cursor Bugbot Context

Scope: These rules apply to all files in the entire project, providing the highest-level context for review and code generation.

1. Project Goal

This project is an advanced, real-time ticket management system. Security and performance are paramount.

2. General Style & Standards

Language: Modern TypeScript/JavaScript for Frontend, Python for Backend/API.

Formatting: Strict adherence to Prettier and Black formatting standards.

Comments: All complex functions, classes, and non-obvious logic MUST be documented with JSDoc/docstrings.

3. Review Priority

Prioritize reviews that address security vulnerabilities, performance regressions, or database schema changes.

4. Forbidden Practices

Never use hardcoded secrets or API keys.

Avoid using any type in TypeScript outside of legacy/vendor integrations.

Do not introduce new external dependencies without explicit team approval.
