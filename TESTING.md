# Testing

Tests turn fast product iteration into safe product iteration. The goal is full
behavioral coverage for new logic, including both successful and failure paths.

## Framework

- Vitest 4 with jsdom
- React Testing Library 16

## Commands

- `npm test` runs the full suite once.
- `npm run test:watch` reruns affected tests while editing.
- `npx tsc --noEmit` checks TypeScript types.
- `npm run lint` checks code quality.
- `npm run build` verifies the production Next.js build.

## Test layers

- Unit tests live in `__tests__/` and cover pure logic, storage boundaries, and edge cases.
- Component tests exercise visible UI behavior and user actions through accessible roles.
- Integration tests should cover flows spanning several modules.
- E2E tests should be added for critical browser-only behavior that jsdom cannot reproduce,
  such as the native Web Share sheet on a real HTTPS origin.

## Conventions

- Name files `*.test.ts` or `*.test.tsx`.
- Assert observable behavior, not component implementation details.
- Test every branch added by a feature, including cancellation and storage failures.
- Reset storage, timers, and mocks in each test so tests remain isolated.
