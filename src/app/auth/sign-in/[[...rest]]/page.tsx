"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn 
        routing="path" 
        path="/auth/sign-in"
        appearance={{
          elements: {
            footerAction: { display: "none" }, // Hides "Don't have an account? Sign up"
          },
        }}
      />
    </div>
  );
}
