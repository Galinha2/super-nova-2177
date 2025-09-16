"use client";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/content/header/HeaderWrapper";
import { ActiveBEProvider } from "@/content/ActiveBEContext";
import { UserProvider } from "@/content/profile/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} flex antialiased`}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <ActiveBEProvider>
              <HeaderWrapper />
              {children}
            </ActiveBEProvider>
          </UserProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}