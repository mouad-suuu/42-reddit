import { NextResponse } from "next/server";
import {
  getProjectBySlug,
  getProject,
  getProjectSessions,
} from "@/lib/fortytwo-api";

/**
 * GET /api/42/projects/[slug]
 * Fetches a single project from the 42 API by slug or ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if slug is numeric (project ID)
    const isNumeric = /^\d+$/.test(slug);

    let project;

    if (isNumeric) {
      // Fetch by ID
      project = await getProject(parseInt(slug, 10));
    } else {
      // Fetch by slug
      project = await getProjectBySlug(slug);
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Optionally fetch project sessions for additional details
    let sessions = [];
    try {
      sessions = await getProjectSessions(project.id);
    } catch {
      // Sessions might not be available for all projects
      console.warn(`Could not fetch sessions for project ${project.id}`);
    }

    // Extract difficulty from sessions if not in project
    const difficulty =
      project.difficulty ||
      sessions.find((s) => s.difficulty)?.difficulty ||
      null;

    return NextResponse.json({
      ...project,
      difficulty,
      sessions,
    });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project from 42 API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
