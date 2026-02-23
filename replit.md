# Amplify Vite React Template (Aetio)

## Overview
A React + TypeScript single-page application built with Vite. Originally an AWS Amplify template, adapted to run in Replit. The app is a product research and analytics insights platform called "Aetio".

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (via @tailwindcss/vite plugin)
- **UI Components**: Radix UI primitives + shadcn/ui pattern
- **Routing**: React Router 7
- **Charts**: Recharts
- **Animations**: Motion (framer-motion successor)

## Project Structure
- `src/` - Source code
  - `main.tsx` - Entry point
  - `App.tsx` - Root component with RouterProvider
  - `routes.tsx` - Route definitions (/, /product, /login, /dashboard)
  - `app/screens/` - Page components (Landing, Product, Login, Dashboard, etc.)
  - `app/components/` - Shared components
  - `app/components/ui/` - shadcn/ui base components
  - `app/data/` - Mock data
  - `styles/` - CSS files (tailwind.css, theme.css, fonts.css, index.css)
- `amplify/` - AWS Amplify backend config (not active in Replit)
- `public/` - Static assets

## Running
- Dev server: `npm run dev` (port 5000, host 0.0.0.0)
- Build: `npm run build`

## Deployment
- Configured as static site deployment
- Build command: `npm run build`
- Public directory: `dist`

## Notes
- AWS Amplify backend dependencies were removed since the Amplify backend is not configured in this environment. The Amplify imports in source code are already commented out.
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility.
