"use client";

import { ContentProvider } from "./hooks/useContent";
import { AuthProvider } from "./hooks/useAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ContentProvider>{children}</ContentProvider>
    </AuthProvider>
  );
}
