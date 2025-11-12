import type { Metadata } from "next";
import { Suspense } from "react"

import "./globals.css";
// import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: "BEST SMM - Professional SMM Panel",
  description: "Professional SMM Panel for social media marketing services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        {/* <Suspense fallback={null}> */}
          <AuthProvider>
            {/* <ThemeProvider> */}
              {children}
              <Toaster />
            {/* </ThemeProvider> */}
          </AuthProvider>
        {/* </Suspense> */}
      </body>
    </html>
  );
}
