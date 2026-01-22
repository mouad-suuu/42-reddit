"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface Project {
  id: string;
  title: string;
  description: string;
  project_id: string;
  status: string;
  difficulty: string;
  max_team_size: number;
  current_team_size: number;
  tech_stack: string[];
  trending_score: number;
  openTasksCount?: number;
}

export function ProjectCard({
  project,
  viewMode,
}: {
  project: Project;
  viewMode: "grid" | "list";
}) {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  const statusVariants: Record<string, "default" | "secondary" | "seal" | "outline"> = {
    recruiting: "seal",
    active: "default",
    beta: "secondary",
    creation: "outline",
  };

  const cyberpunkStatusColors: Record<string, string> = {
    recruiting: "bg-[var(--cyber-cyan)]/10 text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]/30",
    active: "bg-[var(--cyber-green)]/10 text-[var(--cyber-green)] border-[var(--cyber-green)]/30",
    beta: "bg-[var(--cyber-purple)]/10 text-[var(--cyber-purple)] border-[var(--cyber-purple)]/30",
    creation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  };

  if (viewMode === "list") {
    return (
      <Link href={`/projects/${project.id}`}>
        <Card className={`group flex items-center gap-6 p-6 transition-all cursor-pointer ${isCyberpunk
          ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
          : "manga-shadow-hover"
          }`}>
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center border-2 border-border ${isCyberpunk ? "border-[var(--cyber-cyan)] bg-gray-800" : "bg-background"
            }`}>
            <svg
              className={`h-8 w-8 ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className={`font-display font-bold uppercase ${isCyberpunk ? "text-white" : "text-foreground"
                }`}>{project.title}</h3>
              <span className={`text-sm font-mono ${isCyberpunk ? "text-muted-foreground" : "text-muted-foreground"
                }`}>
                {project.project_id}
              </span>
              {isCyberpunk ? (
                <span className={`px-2 py-1 ${cyberpunkStatusColors[project.status] || cyberpunkStatusColors.recruiting} text-xs font-bold border uppercase`}>
                  {project.status}
                </span>
              ) : (
                <Badge variant={statusVariants[project.status] || "outline"}>
                  {project.status}
                </Badge>
              )}
            </div>
            <p className={`text-sm ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"
              }`}>{project.description}</p>
          </div>

          <div className="flex shrink-0 items-center gap-8 text-center">
            <div>
              <div className={`text-xs uppercase font-bold ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}>Open Tasks</div>
              <div className={`font-bold text-xl ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}>
                {project.openTasksCount ?? 0}
              </div>
            </div>
            <div>
              <div className={`text-xs uppercase font-bold ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}>Team</div>
              <div className={`font-bold text-xl ${isCyberpunk ? "text-white" : "text-foreground"
                }`}>
                {project.current_team_size}/{project.max_team_size}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={`group transition-all duration-300 cursor-pointer relative overflow-hidden p-0 ${isCyberpunk
        ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
        : "manga-shadow-hover"
        }`}>
        {/* Top accent line */}
        {isCyberpunk ? (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyber-cyan)] to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        )}

        <div className="absolute right-4 top-4">
          {isCyberpunk ? (
            <span className={`px-2 py-1 ${cyberpunkStatusColors[project.status] || cyberpunkStatusColors.recruiting} text-xs font-bold border uppercase`}>
              {project.status}
            </span>
          ) : (
            <Badge variant={statusVariants[project.status] || "outline"}>
              {project.status}
            </Badge>
          )}
        </div>

        <div className="p-5 pt-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 flex items-center justify-center border-2 border-border mr-3 ${isCyberpunk ? "bg-gray-800 border-gray-700" : "bg-background"
                }`}>
                <svg className={`h-5 w-5 ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className={`font-display font-bold text-lg uppercase transition-colors break-words line-clamp-2 ${isCyberpunk
                  ? "text-white group-hover:text-[var(--cyber-cyan)]"
                  : "text-foreground group-hover:underline"
                  }`}>{project.title}</h3>
                <p className={`text-xs font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                  }`}>
                  ID: #{project.project_id}
                </p>
              </div>
            </div>
          </div>
          <p className={`text-sm mb-4 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"
            }`}>{project.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className={`p-2 border-2 border-border ${isCyberpunk ? "bg-gray-900/50 border-gray-800" : "bg-secondary"
              }`}>
              <div className={`text-xs uppercase font-bold ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}>Open Tasks</div>
              <div className={`font-bold ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}>{project.openTasksCount ?? 0}</div>
            </div>
            <div className={`p-2 border-2 border-border ${isCyberpunk ? "bg-gray-900/50 border-gray-800" : "bg-secondary"
              }`}>
              <div className={`text-xs uppercase font-bold ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}>Difficulty</div>
              <div className={`font-bold capitalize ${isCyberpunk ? "text-white" : "text-foreground"
                }`}>{project.difficulty}</div>
            </div>
            <div className={`p-2 border-2 border-border ${isCyberpunk ? "bg-gray-900/50 border-gray-800" : "bg-secondary"
              }`}>
              <div className={`text-xs uppercase font-bold ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}>Team</div>
              <div className={`font-bold ${isCyberpunk ? "text-white" : "text-foreground"
                }`}>{project.current_team_size}/{project.max_team_size}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {project.tech_stack.slice(0, 2).map((tech) => (
                <span key={tech} className={`text-[10px] px-1.5 py-0.5 border-2 border-border font-mono font-bold ${isCyberpunk ? "border-gray-700 text-gray-400" : "text-foreground"
                  }`}>
                  {tech.toUpperCase()}
                </span>
              ))}
            </div>
            <span className={`text-xs font-bold transition-colors uppercase ${isCyberpunk
              ? "text-gray-500 group-hover:text-white"
              : "text-muted-foreground group-hover:text-foreground"
              }`}>
              View Details <svg className="ml-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* Progress bar */}
          {isCyberpunk ? (
            <div className="h-1 w-full bg-gray-800 mt-auto">
              <div className="h-full bg-[var(--cyber-cyan)]" style={{ width: `${(project.current_team_size / project.max_team_size) * 100}%` }}></div>
            </div>
          ) : (
            <div className="hand-drawn-progress mt-auto">
              <div
                className="hand-drawn-progress-fill"
                style={{ width: `${(project.current_team_size / project.max_team_size) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
