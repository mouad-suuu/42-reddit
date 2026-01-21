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

app/page.tsx: Landing page with hero section
app/auth/callback/page.tsx: OAuth callback handler page
app/profile/page.tsx: Current user's profile showing their 42 projects and stats
app/profile/[login]/page.tsx: Public profile page to view any user's 42 data by login
app/projects/page.tsx: Browse projects stored in database (discovered from user profiles)
app/projects/[slug]/page.tsx: Project detail page with posts and comments

## Backend API (Next.js Route Handlers)

app/api/auth/42/route.ts: 42 Network OAuth initiation endpoint
app/api/auth/callback/route.ts: OAuth callback handler, token exchange, user creation
app/api/auth/me/route.ts: Current authenticated user endpoint
app/api/auth/logout/route.ts: Logout endpoint
app/api/auth/session/route.ts: Session information endpoint
app/api/42/me/route.ts: Current user's full 42 profile from 42 API (also syncs projects to DB)
app/api/42/users/[login]/route.ts: Fetch any user's 42 profile by login (also syncs projects to DB)
app/api/42/projects/route.ts: List 42 curriculum projects from 42 API
app/api/42/projects/[slug]/route.ts: Single project details from 42 API
app/api/projects/route.ts: List projects from database with category filter

## Core Libraries

lib/auth.ts: Authentication helper functions for server-side auth with role support
lib/fortytwo-api.ts: 42 API client with OAuth client credentials flow
lib/project-sync.ts: Auto-discover and sync projects to database when users view profiles
lib/jwt.ts: JWT token generation and verification utilities
lib/utils.ts: Shared utility functions
lib/supabase/server.ts: Supabase server client for database access
lib/supabase/client.ts: Supabase browser client
lib/supabase/proxy.ts: Supabase session proxy middleware

## Contexts

contexts/AuthContext.tsx: Frontend authentication context and hooks
contexts/ThemeContext.tsx: Theme switching context (Cyberpunk/Manga) with localStorage persistence
