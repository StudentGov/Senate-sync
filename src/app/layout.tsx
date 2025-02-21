"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/navBar/NavBar";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { useAssignRole } from "../app/hooks/useAssignRole"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedIn>
              <AssignRoleAfterLogin />
            </SignedIn>
          </header>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

/**
 * Component to trigger the role assignment API after user login.
 * Utilizes the custom hook 'useAssignRole' to check and assign the default role.
 * This ensures the role assignment logic is executed only once per login.
 */
function AssignRoleAfterLogin() {
  // Custom hook to call the role assignment API
  useAssignRole();
  
  // This component does not render anything on the UI
  return null;
}
