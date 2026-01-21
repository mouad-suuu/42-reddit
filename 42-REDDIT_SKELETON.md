## 42 Reddit – Minimal App Skeleton

This file defines the **folder and file structure** for a stripped‑down 42 Reddit app that:

- Reuses **42 OAuth**, **Supabase**, and **Prisma** setup from the Praxis code.
- Reuses the **styling and UI components**.
- Drops Praxis‑specific business features (scores, invitations, meetings, GitHub, etc.).

It is meant as a **copy‑paste skeleton**, not an implementation. Pages/components can start as empty placeholders.

---

## 1. New Repository Layout

Top‑level structure for the new `42-reddit` repository:

- `app/`
  - `layout.tsx` — shared layout, theme provider, nav header.
  - `globals.css` — global styles (reuse from Praxis, adjust only if needed).
  - `page.tsx` — **Home page**: project listing and “Sign in with 42” entry point.
  - `auth/`
    - `callback/page.tsx` — 42 OAuth callback UI page.
    - `login/page.tsx` — optional simple login/redirect page.
  - `projects/`
    - `page.tsx` — alias/list view for all projects (can be same content as home at first).
    - `[slug]/`
      - `page.tsx` — **Project detail page**:
        - Project overview (title, description).
        - List of README posts for this project (one per user).
        - List of recent comments.
        - “Students from your campus who finished this project” block (42 API).
      - `readmes/`
        - `[userId]/`
          - `page.tsx` — **README detail page** for a given user + project.

- `app/api/`
  - `auth/`
    - `42/route.ts` — initiates 42 OAuth flow.
    - `callback/route.ts` — handles 42 OAuth callback, creates/updates user.
    - `logout/route.ts` — logs out user, clears session.
    - `session/route.ts` — returns current session/user.
    - `me/route.ts` — returns current user profile details.
  - `projects/`
    - `list/route.ts` — returns list of projects (for home/projects pages).
  - `posts/`
    - `route.ts` — create/list posts (comments + readmes).
    - `[id]/route.ts` — get/update/delete a single post.
  - `comments/`
    - `route.ts` — create/list comments.
    - `[id]/route.ts` — get/update/delete a single comment.
  - `votes/`
    - `route.ts` — create/update vote on a post or comment.
  - `42/`
    - `project-alumni/route.ts` — proxy to 42 API to fetch students who finished a given project, filtered by campus.

- `components/`
  - `nav-header.tsx` — main navigation bar (can be simplified).
  - `nav-header-client.tsx` — client‑side header logic (theme toggle, user menu).
  - `hero.tsx` — optional landing hero for the home page.
  - `project-card.tsx` — card for a project in the list.
  - `project-list.tsx` — simple list wrapper around `project-card` (new).
  - `readme-card.tsx` — card/preview for a README post (new).
  - `comment-thread.tsx` — displays comments + replies (new).
  - `vote-buttons.tsx` — upvote/downvote UI (new).
  - `rules-markdown.tsx` — markdown renderer (can reuse if convenient).
  - `auth-provider.tsx` — context/provider for auth state on the client.
  - `theme-toggle.tsx` — dark/light/cyberpunk theme toggle.
  - `ui/` — **keep** the Shadcn/ui components:
    - `button.tsx`
    - `card.tsx`
    - `input.tsx`
    - `textarea.tsx`
    - `select.tsx`
    - `tabs.tsx`
    - `avatar.tsx`
    - `badge.tsx`
    - `label.tsx`
    - `checkbox.tsx`

- `contexts/`
  - `AuthContext.tsx` — auth context (reused, but simplified for 42 Reddit needs).
  - `ThemeContext.tsx` — theme context (reuse).

- `lib/`
  - `auth.ts` — 42 OAuth + session helpers (reuse).
  - `supabase/`
    - `client.ts` — Supabase browser client.
    - `server.ts` — Supabase server client.
    - `proxy.ts` — optional if you proxy Supabase.
  - `prisma.ts` — Prisma client setup (reuse, but point to new schema).
  - `jwt.ts` — JWT helpers if used by auth flow.
  - `permissions-client.ts` / `permissions.ts` — **only if needed**; otherwise can be dropped.
  - `cyberpunk-styles.ts` — theme/style helpers (reuse).
  - `utils.ts` — generic helpers (reuse as needed).

- `prisma/`
  - `schema.prisma` — **new schema**, with:
    - `User`
    - `Project`
    - `Post`
    - `Comment`
    - `Vote`

- `content/`
  - `rules/` — optional content pages; keep only if you want static docs in the app.

- `docs/`
  - `AUTH_SETUP.md` — describes 42 OAuth + Supabase integration.
  - `GITHUB_*` docs — **not needed** for 42 Reddit (can be removed or ignored).
  - `PRISMA_SETUP.md` — Prisma configuration steps.
  - `PROJECT_CONTEXT.md` — this project’s functional spec (already present).

- `public/`
  - Logos and theme images (reuse Praxis visuals if desired).

- Root config files:
  - `next.config.ts`
  - `tsconfig.json`
  - `eslint.config.mjs`
  - `postcss.config.mjs`
  - `package.json` / `package-lock.json`
  - `prisma.config.ts`
  - `README.md` — new readme for 42 Reddit.

---

## 2. What to Reuse As‑Is from the Current Codebase

In the initial copy of the repository, you can **keep these files almost unchanged**:

- All **42 auth API routes** under `app/api/auth/*`.
- Supabase client/server setup under `lib/supabase/*`.
- Prisma client setup under `lib/prisma.ts` and `prisma.config.ts` (we will only change `schema.prisma`).
- Theme + global styling:
  - `app/globals.css`
  - `lib/cyberpunk-styles.ts`
  - `contexts/ThemeContext.tsx`
  - `components/theme-toggle.tsx`
- Shared layout and navigation:
  - `app/layout.tsx`
  - `components/nav-header.tsx`
  - `components/nav-header-client.tsx`
- Shadcn UI components under `components/ui/*`.

Everything else (Praxis‑specific pages, GitHub integrations, project/invitation/task APIs, etc.) can be **ignored or deleted** for the new 42 Reddit repository.

---

## 3. Minimal Page Flow (No Implementation Yet)

- **`/` (Home)**
  - Lists projects (from `app/api/projects/list/route.ts`).
  - Shows a prominent “Sign in with 42” button if user is not logged in.

- **`/projects`**
  - Same as home or a slightly more detailed project directory.

- **`/projects/[slug]`**
  - Shows:
    - Project title + description.
    - List of README posts for this project.
    - Recent comments about this project.
    - “Students from your campus who finished this project” (via `app/api/42/project-alumni/route.ts`).

- **`/projects/[slug]/readmes/[userId]`**
  - Displays that user’s README in markdown.
  - Shows voting controls and comments for that README.

- **Auth flow**
  - `Sign in with 42` button → `app/api/auth/42/route.ts` → 42 OAuth → `app/api/auth/callback/route.ts` → redirect back to `/` or `/projects`.

---

## 4. Next Steps After Skeleton

1. **Copy** the listed infrastructure files (auth, Supabase, Prisma, styling, UI components) into the new repository.
2. **Create empty page and API route files** matching the structure above (they can export minimal placeholders for now).
3. Define the new **Prisma schema** for `User`, `Project`, `Post`, `Comment`, and `Vote`.
4. Wire up the pages to the APIs step by step:
   - Home/projects list.
   - Project detail with 42 alumni block.
   - README detail with comments and voting.

This skeleton keeps 42 auth + Supabase + Prisma + styling **intact**, while stripping the business logic down to the essentials for the 42 Reddit course project.

