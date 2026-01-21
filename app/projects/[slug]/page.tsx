"use client";

import { useParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Project detail page placeholder.
 * Shows project info, posts, comments section.
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className={`mb-6 text-sm font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
        <Link href="/projects" className={`hover:underline ${isCyberpunk ? "hover:text-[var(--cyber-cyan)]" : ""}`}>
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>{slug}</span>
      </div>

      {/* Placeholder content */}
      <div
        className={`text-center py-20 ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "bg-card border-2 border-border manga-shadow"
        }`}
      >
        <div className="text-6xl mb-4">🚧</div>
        <h1 className={`text-3xl font-display font-black uppercase mb-4 ${isCyberpunk ? "text-white" : "text-foreground"}`}>
          {slug.replace(/-/g, " ")}
        </h1>
        <p className={`mb-6 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
          Project detail page coming soon! This will show posts, READMEs, and comments.
        </p>
        <Button asChild>
          <Link href="/projects">← Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
}
