"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Environment:</h3>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>Next.js ENV: {process.env.NEXT_PUBLIC_NODE_ENV}</p>
        </div>

        <div>
          <h3 className="font-semibold">Auth State:</h3>
          <p>isLoading: {isLoading.toString()}</p>
          <p>isAuthenticated: {isAuthenticated.toString()}</p>
        </div>

        <div>
          <h3 className="font-semibold">User Data:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Role Check:</h3>
          <p>user?.role: {typeof user?.role} - {JSON.stringify(user?.role)}</p>
          <p>Is customer (string): {typeof user?.role === "string" && user.role === "customer" ? "YES" : "NO"}</p>
          <p>Is customer (object): {typeof user?.role === "object" && user.role?.name === "customer" ? "YES" : "NO"}</p>
        </div>
      </div>
    </div>
  );
} 