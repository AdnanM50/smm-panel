import type { Metadata } from "next";
import { Suspense } from "react"

import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";


export const metadata: Metadata = {
  title: "Google Index Checker",
  description: "Check if your website is indexed by Google.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans `}>
        <Suspense fallback={null}>
          <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
        </Suspense>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
