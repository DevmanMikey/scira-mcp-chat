"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useLocalStorage } from "@/lib/hooks/use-local-storage";
// import { STORAGE_KEYS } from "@/lib/constants";
import { MCPProvider } from "@/lib/context/mcp-context";
import { Menu } from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});


export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
        themes={["light", "dark", "sunset", "black"]}
      >
        <MCPProvider>
          <SidebarProvider open={true}>
            <div className="flex h-dvh w-full relative">
              {/* SidebarTrigger removed for always-on sidebar */}
              {children}
            </div>
            <Toaster position="top-center" richColors />
          </SidebarProvider>
        </MCPProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


