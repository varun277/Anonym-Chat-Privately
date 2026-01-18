import { redis } from "@/lib/redis";
import Elysia from "elysia";

// Authentication middleware
export const authMiddleware = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ cookie, query }) => {
    // Authentication logic here
    const roomId = query.roomId as string | undefined;
    const token = cookie["x-auth-token"]?.value as string | undefined;

    // Check if roomId and token are present
    if (!roomId || !token) {
      throw new Error("Missing roomId or token");
    }

    const connected = (await redis.hget<{ connected: string[] }>(
      `meta:${roomId}`,
      "connected"
    )) as string[] | null;

    if (!connected || !connected?.includes(token)) {
      throw new Error("Invalid token for the room");
    }
    return { auth: { roomId, token, connected } };
  }
);
