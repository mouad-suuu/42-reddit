"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
  // Status badge class mapping - uses CSS-only theme classes
  const statusBadgeClass: Record<string, string> = {
    recruiting: "t-badge-recruiting",
    active: "t-badge-active",
    beta: "t-badge-beta",
    creation: "t-badge-creation",
  };

  if (viewMode === "list") {
    return (
      <Link href={`/projects/${project.id}`}>
        <Card className="group flex items-center gap-6 p-6 cursor-pointer t-card t-card-interactive">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center t-icon-box">
            <svg
              className="h-8 w-8 t-text-accent"
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
              <h3 className="font-display font-bold uppercase t-text-primary">{project.title}</h3>
              <span className="text-sm font-mono t-text-muted">
                {project.project_id}
              </span>
              <span className={`px-2 py-1 text-xs font-bold border uppercase ${statusBadgeClass[project.status] || statusBadgeClass.recruiting}`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm t-text-muted">{project.description}</p>
          </div>

          <div className="flex shrink-0 items-center gap-8 text-center">
            <div>
              <div className="text-xs uppercase font-bold t-text-subtle">Open Tasks</div>
              <div className="font-bold text-xl t-text-accent">
                {project.openTasksCount ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold t-text-subtle">Team</div>
              <div className="font-bold text-xl t-text-primary">
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
      <Card className="group transition-all duration-300 cursor-pointer relative overflow-hidden p-0 t-card t-card-interactive">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 t-accent-line"></div>

        <div className="absolute right-4 top-4">
          <span className={`px-2 py-1 text-xs font-bold border uppercase ${statusBadgeClass[project.status] || statusBadgeClass.recruiting}`}>
            {project.status}
          </span>
        </div>

        <div className="p-5 pt-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center mr-3 t-icon-box-subtle">
                <svg className="h-5 w-5 t-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg uppercase break-words line-clamp-2 t-text-primary t-text-accent-hover">{project.title}</h3>
                <p className="text-xs font-mono t-text-subtle">
                  ID: #{project.project_id}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm mb-4 t-text-muted">{project.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="p-2 t-stat-box">
              <div className="text-xs uppercase font-bold t-text-subtle">Open Tasks</div>
              <div className="font-bold t-text-accent">{project.openTasksCount ?? 0}</div>
            </div>
            <div className="p-2 t-stat-box">
              <div className="text-xs uppercase font-bold t-text-subtle">Difficulty</div>
              <div className="font-bold capitalize t-text-primary">{project.difficulty}</div>
            </div>
            <div className="p-2 t-stat-box">
              <div className="text-xs uppercase font-bold t-text-subtle">Team</div>
              <div className="font-bold t-text-primary">{project.current_team_size}/{project.max_team_size}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {project.tech_stack.slice(0, 2).map((tech) => (
                <span key={tech} className="text-[10px] px-1.5 py-0.5 font-mono font-bold t-tech-tag">
                  {tech.toUpperCase()}
                </span>
              ))}
            </div>
            <span className="text-xs font-bold uppercase t-text-muted group-hover:t-text-primary transition-colors">
              View Details <svg className="ml-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full mt-auto t-progress-track">
            <div className="h-full t-progress-fill" style={{ width: `${(project.current_team_size / project.max_team_size) * 100}%` }}></div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
