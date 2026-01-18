import { NextRequest, NextResponse } from "next/server";
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";

export default async function proxy(req: NextRequest) {
  // Check if user are allowed to join room
  // Allow if they are
  // if they are not redirect back to lobby
  const pathname = req.nextUrl.pathname;

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/);
  if (!roomMatch) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const roomId = roomMatch[1];
  const data = await redis.hgetall<{ connected: string[]; createdAt: Number }>(
    `meta:${roomId}`
  );

  if (!data || Object.keys(data).length === 0) {
    return NextResponse.redirect(new URL("/?error=room-not-found", req.url));
  }
  // Check if user already has a token [If user is refreshed then no need to create a new token and add again to connected list]
  const existingToken = req.cookies.get("x-auth-token")?.value;
  if (existingToken && data?.connected.includes(existingToken)) {
    return NextResponse.next();
  }
  // If connected users are more than or equal to 2, redirect new user to the lobby
  if (data?.connected?.length >= 2) {
    return NextResponse.redirect(new URL("/?error=room-full", req.url));
  }

  const response = NextResponse.next();
  // Generate a token for the user
  const token = nanoid();
  response.cookies.set("x-auth-token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  await redis.hset(`meta:${roomId}`, {
    connected: [...data?.connected, token],
  });

  return response;
}

export const config = {
  matcher: "/room/:path*",
};
