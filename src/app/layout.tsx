"use client";

import { Geist, Geist_Mono, Kanit  } from "next/font/google";

import "./globals.css";
import NavBar from "./components/navBar/navBar";
import Footer from "./components/footer/Footer";

import { CollapsedProvider } from "./components/sideBar/sideBarContext";

import { ClerkProvider } from "@clerk/nextjs";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Customize weights if needed
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} antialiased flex flex-col min-h-screen`}
        >
          <NavBar />
          <CollapsedProvider>
            <main className="flex-1">
              {children}
            </main>
          </CollapsedProvider>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}


