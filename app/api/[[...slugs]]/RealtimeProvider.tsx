"use client";

import { RealtimeProvider } from "@upstash/realtime/client";

export function RealtimeProviders({ children }: { children: React.ReactNode }) {
  return <RealtimeProvider>{children}</RealtimeProvider>;
}
