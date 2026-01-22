"use client";

import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    // Key triggers re-render of animation on route change
    const pathname = usePathname();

    return (
        <div
            key={pathname}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
        >
            {children}
        </div>
    );
}
