# Meetdown2 Project Guide

## Build & Development Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **TypeScript**: Use strict TypeScript with accurate types; prefer interfaces over types
- **React**: Use functional components with hooks; avoid classes
- **Naming**: Use lowercase with dashes for directories (e.g., components/auth-wizard)
- **Components**: Use named exports; structure files with exports first, then subcomponents
- **Functions**: Use the "function" keyword for pure functions
- **Variables**: Use descriptive names with auxiliary verbs (isLoading, hasError)

## Temporal Library
- Use Temporal API for date/time operations; avoid native Date objects
- Compare dates with Temporal.PlainDate.compare()

## Next.js & React Patterns
- Minimize 'use client' directives; favor React Server Components
- Use Tailwind CSS for styling with mobile-first approach
- Optimize Web Vitals (LCP, CLS, FID)
- Wrap client components in Suspense with fallback