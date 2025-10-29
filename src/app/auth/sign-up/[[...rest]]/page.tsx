"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Sign-Up Page
 * 
 * IMPORTANT: Public sign-up should be disabled in Clerk Dashboard.
 * This page redirects users to sign-in since account creation
 * is now handled exclusively through the admin panel.
 */
export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to unauthorized page
    // since public sign-up is disabled
    router.replace("/unauthorized");
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-purple-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Public Sign-Up Disabled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Account creation is managed by administrators. If you're a senator, coordinator, 
          or staff member, your account will be created for you.
        </p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Already have an account?
          </p>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact your student government administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
