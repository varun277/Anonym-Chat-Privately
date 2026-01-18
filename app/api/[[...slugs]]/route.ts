import { redis } from "@/lib/redis";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { cors } from "@elysiajs/cors";
import { authMiddleware } from "./auth";
import { Message, realtime } from "@/lib/realtime";
import dotenv from "dotenv";

// Load appropriate .env file based on environment
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
dotenv.config({ path: envFile });

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const CONNECTION_TTL = 60 * 10; // 10 minutes

const room = new Elysia({ prefix: "/room" })
  .post("/create", async () => {
    const roomId = nanoid();

    await redis.hset(`meta:${roomId}`, {
      connected: [],
      createdAt: Date.now(),
    });

    await redis.expire(`meta:${roomId}`, CONNECTION_TTL);

    return { roomId };
  })
  .get("/ttl", async (auth: any) => {
    const roomId = auth?.query?.roomId as string;

    if (typeof roomId !== "string" && !roomId) {
      throw new Error("Roomt ID is required");
    }
    const ttl = await redis.ttl(`meta:${roomId}`);
    return { ttl: ttl && ttl > 0 ? ttl : 0 };
  })
  .delete("/", async (auth: any) => {
    const roomId = auth?.query?.roomId as string;

    await Promise.all([
      redis.del(roomId),
      redis.del(`meta:${roomId}`),
      redis.del(`messages:${roomId}`),
    ]);

    await realtime.channel(roomId).emit("chat.destroy", { isDestroyed: true });
  });

const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post("/", async ({ body, auth }) => {
    // Get the message details from the body and validate
    const parsedBody = body as { sender: string; text: string };
    if (
      !parsedBody ||
      typeof parsedBody.sender !== "string" ||
      typeof parsedBody.text !== "string"
    ) {
      throw new Error("Invalid message body");
    }
    const { sender, text } = parsedBody;
    const { roomId, token } = auth;
    const roomExist = await redis.exists(`meta:${roomId}`);
    if (!roomExist) {
      throw new Error("Room does not exist");
    }

    // Store message in Redis and emit via Realtime
    const message = {
      id: nanoid(),
      sender: sender,
      text: text,
      timestamp: Date.now(),
      roomId: roomId,
      token: token,
    };

    await redis.rpush(`messages:${roomId}`, { ...message, token: auth.token });
    await realtime.channel(roomId).emit("chat.message", message);
    // Get the remaining TTL of the room
    const remainingTTL = await redis.ttl(`meta:${roomId}`);

    // Expire messages and history keys with the same TTL
    await redis.expire(`messages:${roomId}`, remainingTTL);
    await redis.expire(`history:${roomId}`, remainingTTL);
    await redis.expire(roomId, remainingTTL);
  })
  .get("/", async ({ auth }) => {
    const { roomId, token } = auth;
    const messages = await redis.lrange<Message>(`messages:${roomId}`, 0, -1);
    return {
      messages: messages?.map((msg) => ({
        ...msg,
        token: msg?.token === token ? msg.token : undefined,
      })),
    };
  });

const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: (origin) => {
        if (!origin || allowedOrigins.includes(origin as any)) {
          // Allow requests with no origin (like mobile apps, postman or curl) or if origin is in the allowed list
          return true;
        }
        return false;
      },
    })
  ) // Enable CORS for all origins
  .use(room)
  .use(messages);

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;

export type App = typeof app;
