import { Providers } from "@/components/Provider";
import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { RealtimeProviders } from "./api/[[...slugs]]/RealtimeProvider";

const jetBrains = JetBrains_Mono({
  variable: "--jetbrainsMono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anonym - Real-time Anonymous Chat",
  description:
    "Connect and chat with strangers in real-time without revealing your identity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jetBrains.className}>
        <RealtimeProviders>
          <Providers>{children}</Providers>
        </RealtimeProviders>
      </body>
    </html>
  );
}
