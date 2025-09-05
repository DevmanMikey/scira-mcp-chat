import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Providers } from "./providers";
// import { useOpenPlatformUser } from "@/lib/hooks/use-openplatform-user";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { BotIdClient } from "botid/client";
import { AuthOverlay } from "@/components/auth-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inspiraus Flow",
  description: "A modern AI chat application with MCP integration.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BotIdClient
          protect={[
            {
              path: "/api/chat",
              method: "POST",
            }
          ]}
        />
      </head>
      <body className={`${inter.className}`}> 
        <Providers>
          <AuthOverlay />
          <ChatSidebar />
          <main className="flex-1 flex flex-col relative">
            <div className="flex-1 flex justify-center pt-16 md:pt-0">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}


