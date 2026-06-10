import { ReactNode, Suspense } from "react";

export default function ExploreLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}
