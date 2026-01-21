# Project Map

## Core Documentation

PROJECT_CONTEXT.md: Overview of the 42 Reddit platform vision, features, and data model
docs/AUTH_SETUP.md: 42 Network OAuth authentication setup guide
docs/PRISMA_SETUP.md: Prisma ORM setup and migration guide

## Database & ORM

prisma/schema.prisma: Prisma generator/datasource setup (models to be defined for 42 Reddit)
lib/prisma.ts: Prisma client singleton for database operations

## Frontend Components

components/nav-header.tsx: Main navigation header
components/nav-header-client.tsx: Client-side navigation header
components/project-card.tsx: Project card display component for 42 projects
components/auth-provider.tsx: Authentication context provider
components/project-readme.tsx: README markdown display component for project posts
components/theme-toggle.tsx: Theme toggle button for switching between Cyberpunk and Manga themes

## Pages

app/page.tsx: Landing page (will be adapted to list 42 Reddit projects)
app/auth/callback/page.tsx: OAuth callback handler page

## Backend API (Next.js Route Handlers)

app/api/auth/42/route.ts: 42 Network OAuth initiation endpoint
app/api/auth/callback/route.ts: OAuth callback handler, token exchange, user creation
app/api/auth/me/route.ts: Current authenticated user endpoint
app/api/auth/logout/route.ts: Logout endpoint
app/api/auth/session/route.ts: Session information endpoint

## Core Libraries

lib/auth.ts: Authentication helper functions for server-side auth with role support
lib/permissions.ts: Server-side permission checking utilities for RBAC
lib/permissions-client.ts: Client-side React hooks for permission checks
lib/jwt.ts: JWT token generation and verification utilities
lib/utils.ts: Shared utility functions
lib/supabase/server.ts: Supabase server client for database access
lib/supabase/client.ts: Supabase browser client
lib/supabase/proxy.ts: Supabase session proxy middleware

## Contexts

contexts/AuthContext.tsx: Frontend authentication context and hooks
contexts/ThemeContext.tsx: Theme switching context (Cyberpunk/Manga) with localStorage persistence
