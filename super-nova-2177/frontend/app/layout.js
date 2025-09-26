"use client";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/content/header/HeaderWrapper";
import { ActiveBEProvider } from "@/content/ActiveBEContext";
import { UserProvider } from "@/content/profile/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Error from "@/content/Error";
import Notification from "@/content/Notification";
import { useState } from "react";

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function RootLayout({ children }) {
  const [errorMsg, setErrorMsg] = useState([]);
  const [notify, setNotify] = useState([]);
  return (
    <html lang="en">
      <body className={`${interTight.variable} flex antialiased`}>
        <QueryClientProvider client={queryClient}>
          {errorMsg.length > 0 && <Error messages={errorMsg} />}
          {notify.length > 0 && <Notification messages={notify} />}
          <UserProvider>
            <ActiveBEProvider>
              <HeaderWrapper
                setNotify={setNotify}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
              />
              {children}
            </ActiveBEProvider>
          </UserProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}