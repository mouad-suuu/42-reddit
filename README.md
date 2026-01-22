# 42 Reddit

## Description
42 Reddit is a community platform designed specifically for students of the 42 Network. It allows users to discuss projects, share resources, and interact with peers in a reddit-style format.

#### born to solve:
- Not clear projects Subjects
- Not clear projects Objectives
- Wasting time looking for the context
- A commun place to share resources and documentations made by peers
- A way to find peers that have finished the same projects you'are working on that are available in your campus

## Features
- **42 Authentication**: Secure login using 42 Intra OAuth.
- **Project Discussions**: Dedicated threads for every 42 project.
- **Find peers**: Find peers that have finished the same projects you'are working on, can be filtered by campus and logged in.
- **Vote System**: Upvote/downvote posts and comments to highlight quality content.
- **Markdown Support**: Rich text formatting for READMEs and comments.
- **User Profiles**: View 42 stats, campus info, and activity history.
- **Real-time Caching**: Fast data retrieval using Redis for 42 API responses.
- **Project Tracking**: Browse projects by cursus, circle, and completion status.
- **Responsive Design**: Modern UI/UX optimized for all devices.

## Tech Stack
This project is built using modern web technologies:

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Language**: TypeScript
- **Runtime**: [Bun](https://bun.sh/)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Caching**: Redis (hosted on [Railway](https://railway.app/) or local) using `ioredis`
- **Styling**: Tailwind CSS, Radix UI
- **Containerization**: Docker
- **Deployment**: Railway

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```ini
# 42 API Configuration (Get these from 42 API settings)
FORTYTWO_CLIENT_ID="your_client_id"
FORTYTWO_CLIENT_SECRET="your_client_secret"
Redirect_URL="http://localhost:3000/api/auth/callback/" # Adjust for production

# Database Configuration (Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
sUPABASE_PASSWORD="your_db_password"

# Prisma Connection Strings
# Transaction connection (pgbouncer)
DATABASE_URL="postgresql://postgres.[ref]:[password]@[host]:6543/postgres?pgbouncer=true"
# Session connection (direct)
DIRECT_URL="postgresql://postgres.[ref]:[password]@[host]:5432/postgres"

# App Secrets
JWT_SECRET="your_jwt_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Redis Configuration
# For local dev using Railway Redis:
REDIS_URL="redis://default:password@public-host:port"
# For production/docker internal:
# REDIS_URL="redis://redis:6379"
```

## How to Run Locally

### Prerequisites
- [Bun](https://bun.sh/) installed
- Docker (optional, for local Redis)

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd 42-reddit
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Generate Prisma client:
    ```bash
    bunx prisma generate
    ```

### Development Server
Run the development server:
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Using Docker
To run the entire stack (App + Redis) in Docker containers:
```bash
docker compose up --build
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## How to Deploy

### Railway Deployment
The project is optimized for deployment on [Railway](https://railway.app/).

1.  **Push to GitHub**: Ensure your code is in a GitHub repository.
2.  **New Project on Railway**:
    *   Select "Deploy from GitHub repo".
    *   Choose your repository.
3.  **Add Database (Redis)**:
    *   Right-click on the canvas -> New -> Database -> Redis.
4.  **Configure Environment Variables**:
    *   Go to the app service settings -> Variables.
    *   Add all variables from your `.env` file.
    *   **Important**: Railway provides `REDIS_URL` automatically if you link the services, but ensure your app is configured to use it.
    *   Ensure `NIXPACKS_PKGS` or `dockerfile` usage is correct. We use a custom `Dockerfile`.
5.  **Build & Deploy**:
    *   Railway should detect the `Dockerfile` and build automatically.
    *   The `Dockerfile` handles `prisma generate` and the build process.

### Docker Deployment
You can build the image anywhere Docker is available:
```bash
docker build \
  --build-arg DATABASE_URL="your_db_url" \
  --build-arg DIRECT_URL="your_direct_url" \
  ... (other args) ... \
  -t 42-reddit .
```
