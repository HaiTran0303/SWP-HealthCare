"use client";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authKey, setAuthKey] = useState(0);
  useEffect(() => {
    setAuthKey(Date.now());
  }, []);
  return <AuthProvider key={authKey}>{children}</AuthProvider>;
}
