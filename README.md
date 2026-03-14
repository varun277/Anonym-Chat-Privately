# Anonym Chat Privately 🕵️‍♂️💬

A private, secure, and self-destructing real-time chat room application built with modern web technologies.

## 🚀 Features

- **Private & Secure Rooms:** Create temporary chat rooms for private conversations.
- **Self-Destructing:** Rooms and all associated messages automatically self-destruct after 10 minutes of inactivity.
- **Limited Access:** Rooms are limited to a maximum of 2 participants ensuring privacy.
- **Real-time Messaging:** Experience instantaneous message delivery with zero polling.
- **Anonymous Identities:** Automatically generates a random identity for users.
- **No Login Required:** Join and chat completely anonymously.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Backend API:** [Elysia.js](https://elysiajs.com/) (running on Next.js Route Handlers)
- **Database & Pub/Sub:** [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- **Real-time:** [@upstash/realtime](https://upstash.com/docs/realtime/overall/getstarted)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)

## 🏗️ Architecture

- **Next.js Middleware/Proxy (`proxy.ts`):** Handles room admission, validates if a room is full, checks for existing active tokens (`x-auth-token`), and redirects unauthorized users to the lobby.
- **Elysia.js Routes (`app/api/[[...slugs]]/route.ts`):** Powers the backend endpoints (`/api/room/create`, `/api/messages`, etc.) with built-in CORS and room TTL management.
- **Upstash Redis:** Stores room metadata, active connections, and chat messages.

## 💻 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) installed. You will also need an Upstash Redis database and Upstash Realtime credentials.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd Anonym-Chat-Privately
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Upstash credentials:
   ```env
   UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
   # Add Realtime tokens and allowed origins if configured.
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ How It Works

1. A user clicks "CREATE SECURE ROOM" on the home page.
2. The backend generates a unique `roomId` and provisions metadata in Redis with a 10-minute TTL.
3. Upon joining a room URL, `proxy.ts` evaluates if the user can enter (max 2 participants); if valid, sets an `x-auth-token` cookie.
4. Messages traverse through Elysia's `/api/messages` endpoint, dispatch events via `@upstash/realtime`, and persist briefly in Redis.
5. All data vanishes seamlessly from Redis once the TTL expires.

---
Contributions, issues, and feature requests are welcome!
