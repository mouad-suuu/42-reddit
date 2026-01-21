"use client";

import { AuthProvider as Provider } from "@/contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
