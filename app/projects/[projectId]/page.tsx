"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

/**
 * Project detail page - shows info, READMEs, and comments for a 42 project.
 * Placeholder UI until backend integration.
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  // Mock project data
  const project = {
    name: projectId.replace(/-/g, "_"),
    slug: projectId,
    description:
      "This is a placeholder description for the project. The actual data will come from the 42 API.",
    tier: 2,
    difficulty: 1855,
  };

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div
        className={`mb-6 text-sm font-mono ${
          isCyberpunk ? "text-gray-500" : "text-muted-foreground"
        }`}
      >
        <Link
          href="/42-projects"
          className={`hover:underline ${
            isCyberpunk ? "hover:text-[var(--cyber-cyan)]" : ""
          }`}
        >
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>
          {project.name}
        </span>
      </div>

      {/* Header */}
      <div
        className={`p-8 mb-8 ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "bg-card border-2 border-border manga-shadow"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h1
                className={`text-4xl font-display font-black uppercase ${
                  isCyberpunk ? "cyber-gradient-text" : "text-foreground"
                }`}
              >
                {project.name}
              </h1>
              <Badge
                variant={isCyberpunk ? "outline" : "secondary"}
                className={`text-lg px-4 py-1 ${
                  isCyberpunk ? "border-[var(--cyber-cyan)]" : ""
                }`}
              >
                Tier {project.tier}
              </Badge>
            </div>
            <p
              className={`text-lg max-w-3xl ${
                isCyberpunk ? "text-gray-400" : "text-muted-foreground"
              }`}
            >
              {project.description}
            </p>
          </div>
          <div
            className={`text-right ${
              isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
            }`}
          >
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">
              XP Reward
            </div>
            <div className="text-3xl font-display font-black">
              {project.difficulty?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs placeholder */}
      <div className="flex gap-4 mb-8">
        <Button
          variant="default"
          className={
            isCyberpunk
              ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
              : ""
          }
        >
          READMEs
        </Button>
        <Button variant="outline">Comments</Button>
        <Button variant="outline">Who Completed</Button>
      </div>

      {/* Content placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* READMEs section */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-display font-bold uppercase ${
                  isCyberpunk ? "text-white" : "text-foreground"
                }`}
              >
                Community READMEs
              </h2>
              <Button size="sm" variant="outline">
                + Share README
              </Button>
            </div>

            {/* Empty state */}
            <div
              className={`text-center py-12 ${
                isCyberpunk
                  ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)]"
                  : "bg-secondary border-2 border-border"
              }`}
            >
              <div
                className={`text-4xl mb-4 ${
                  isCyberpunk ? "text-gray-700" : "text-muted-foreground/30"
                }`}
              >
                📝
              </div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isCyberpunk ? "text-white" : "text-foreground"
                }`}
              >
                No READMEs yet
              </h3>
              <p
                className={`mb-4 ${
                  isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                }`}
              >
                Be the first to share your README for this project!
              </p>
              <Button
                className={
                  isCyberpunk
                    ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                    : ""
                }
              >
                Share Your README
              </Button>
            </div>
          </Card>

          {/* Comments section */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-display font-bold uppercase ${
                  isCyberpunk ? "text-white" : "text-foreground"
                }`}
              >
                Discussion
              </h2>
            </div>

            {/* Empty state */}
            <div
              className={`text-center py-12 ${
                isCyberpunk
                  ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)]"
                  : "bg-secondary border-2 border-border"
              }`}
            >
              <div
                className={`text-4xl mb-4 ${
                  isCyberpunk ? "text-gray-700" : "text-muted-foreground/30"
                }`}
              >
                💬
              </div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isCyberpunk ? "text-white" : "text-foreground"
                }`}
              >
                No comments yet
              </h3>
              <p
                className={`${
                  isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                }`}
              >
                Start the conversation about this project!
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Who completed - placeholder */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <h3
              className={`text-lg font-display font-bold uppercase mb-4 ${
                isCyberpunk ? "text-white" : "text-foreground"
              }`}
            >
              Who Completed This
            </h3>
            <p
              className={`text-sm mb-4 ${
                isCyberpunk ? "text-gray-400" : "text-muted-foreground"
              }`}
            >
              Find 42 students who finished this project and can help you.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>

          {/* Quick stats */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <h3
              className={`text-lg font-display font-bold uppercase mb-4 ${
                isCyberpunk ? "text-white" : "text-foreground"
              }`}
            >
              Project Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span
                  className={
                    isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                  }
                >
                  READMEs
                </span>
                <span
                  className={`font-mono font-bold ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`}
                >
                  0
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={
                    isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                  }
                >
                  Comments
                </span>
                <span
                  className={`font-mono font-bold ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`}
                >
                  0
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={
                    isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                  }
                >
                  Completions
                </span>
                <span
                  className={`font-mono font-bold ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`}
                >
                  —
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
