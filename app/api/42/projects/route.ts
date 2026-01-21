import { NextResponse } from "next/server";
import { getProjects, getAllProjects, searchProjects } from "@/lib/fortytwo-api";

/**
 * GET /api/42/projects
 * Fetches projects from the 42 API.
 *
 * Query params:
 * - cursus: cursus ID (default: 21 for 42cursus)
 * - page: page number (default: 1)
 * - per_page: items per page (default: 100, max: 100)
 * - search: search query to filter by name
 * - all: if "true", fetch from all cursus (not just 42cursus)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursusId = parseInt(searchParams.get("cursus") || "21", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "100", 10),
      100
    );
    const search = searchParams.get("search");
    const fetchAll = searchParams.get("all") === "true";

    let projects;

    if (search) {
      // Search by name
      projects = await searchProjects(search, cursusId);
    } else if (fetchAll) {
      // Fetch from all cursus
      projects = await getAllProjects(page, perPage);
    } else {
      // Fetch from specific cursus (default: 42cursus)
      projects = await getProjects(cursusId, page, perPage);
    }

    return NextResponse.json({
      projects,
      pagination: {
        page,
        per_page: perPage,
        total: projects.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch 42 projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects from 42 API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
