# 42 Reddit – Project Context

## 1. Core Idea

42 Reddit is a community space for 42 students to share experience about 42 projects:

- Comments, notes, and recommendations about specific 42 projects
- Personal README-style writeups per user per project
- Discussion threads, replies, and voting around those readmes and comments

Instead of general social features, the focus is on practical, project-level knowledge: how people actually passed or mastered a given project, with a simple, fast interface.

## 2. Target Users and Use Cases

**Primary users:**

- 42 students currently working on a project
- 42 students who already completed a project and want to share what helped them

**Key use cases:**

- Find all posts and readmes related to a specific 42 project
- See who in your campus already finished this project (via the 42 API)
- Read personal readmes per user per project to understand approaches, pitfalls, and tips
- Ask questions in comment threads and get replies from people who passed
- Upvote/downvote comments and readmes so the best content surfaces first

## 3. Core Features (MVP)

### 3.1 Authentication & Identity

- Login via 42 Network OAuth (same flow and infrastructure as Praxis platform)
- Store basic user profile in our database (id, login, campus, display data needed in UI)
- Keep sessions in Supabase/NextAuth-style integration (reuse existing auth setup)

### 3.2 Projects Directory

- A simple list of 42 projects supported by the app (we can start with a fixed set or seed data)
- Each project has a detail page with:
  - Project title and short description
  - Aggregated stats (number of posts/readmes/comments, basic trending info)
  - Links to individual user readmes and comment threads

### 3.3 Posts and Readmes

- Each project can have multiple posts
- Two main post types:
  - **Comment**: short text comment about the project (tips, warnings, quick notes)
  - **README**: markdown text pasted by a user, rendered as markdown in the UI
- Each user can have at most one README per project (but many comments)

### 3.4 Comments and Replies

- Comment threads attached to:
  - A project in general
  - A specific README post
- Nested replies (comments on comments) with a simple tree or flat-with-parent structure
- Basic moderation tools can be added later; MVP focuses on creating and reading threads

### 3.5 Voting

- Upvotes and downvotes on:
  - Comments
  - README posts
- Simple score calculation per item (e.g. `score = upvotes - downvotes`)
- Later we can experiment with ranking by recency + score, but MVP can be simple score sorting

### 3.6 42 API Integration (Project Alumni)

- For a given project page, call the 42 API to:
  - Fetch students who finished this project
  - Filter by the current user’s campus
- Display a list of "project alumni" so users can:
  - See who actually passed this project
  - Optionally cross-reference them with accounts in our database (if they have logged in)

## 4. Data Model (Conceptual)

This is **not** the exact Prisma schema, just a conceptual model for the app:

- **User**
  - id (42 id or internal id), login, display name, avatar, campus
- **Project**
  - id, slug, title, short description, optional 42 project id reference
- **Post**
  - id, projectId, authorId, type (`COMMENT` | `README`)
  - title (for README-type posts), content (markdown or plain text)
  - createdAt, updatedAt
- **Comment**
  - id, postId (or projectId for general comments), authorId
  - parentCommentId (nullable, for replies)
  - content (text), createdAt, updatedAt
- **Vote**
  - id, userId
  - targetType (`POST` | `COMMENT`)
  - targetId
  - value (`+1` or `-1`)

The real Prisma schema will be defined specifically for 42 Reddit and does **not** reuse the Praxis project/score/invitation tables.

## 5. Pages and Navigation (MVP)

### 5.1 Home Page

- Shows a list of available 42 projects
- Basic filters or search by project name
- Highlights projects with recent activity (new posts or comments)

### 5.2 Project Detail Page

- URL shape: `/projects/[slug]`
- Sections:
  - Project overview (description, possibly link to official 42 project page)
  - List of README posts for this project (one per user)
  - List of recent comments
  - Block showing "Students from your campus who finished this project" (from 42 API)

### 5.3 README Detail Page

- URL shape (conceptual): `/projects/[slug]/readmes/[userSlugOrId]`
- Displays a specific user’s README in markdown format
- Shows voting controls and comment thread for this README

### 5.4 Authentication Flows

- 42 OAuth login redirect page (callback)
- Optional: a simple "Sign in with 42" entry point on the home page

## 6. Tech Stack and Reuse from Praxis

We intentionally reuse most of the existing infrastructure from the Praxis platform:

- **Next.js App Router** with TypeScript
- **Supabase** for authentication/session storage
- **Prisma** as ORM (but with a dedicated schema for 42 Reddit)
- **Shadcn/UI + custom components** for consistent styling
- **Cyberpunk/Manga theming** and theme context

We keep the authentication, theme, and core layout components, but drop the Praxis-specific concepts:

- No contribution scores, roles, invitations, or meetings
- No GitHub integration (repos, tasks, sync)
- No club governance or project pitch workflow

## 7. Non-Goals (for Now)

- Advanced moderation (reports, bans, shadow bans, etc.)
- Complex ranking algorithms or recommendation engines
- Real-time updates (websockets) — initial version can be request/response only
- Cross-project dashboards and analytics

These can be added later once the basic reading/posting experience is solid.

## 8. Guiding Principles

- Keep the UI simple and fast: low friction to read and write content
- Focus on **practical value**: help students actually pass and understand projects
- Respect 42 API limits and data policies
- Prefer clear, predictable flows over clever features
