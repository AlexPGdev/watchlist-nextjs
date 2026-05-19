"use client";

import { ContentProvider } from "./hooks/useContent";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ContentProvider>{children}</ContentProvider>;
}
