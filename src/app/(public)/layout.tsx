import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

// import Navbar from "@/components/layout/navber";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      
      <body
      suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* <Navbar /> */}
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
