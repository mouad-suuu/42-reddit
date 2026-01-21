import { NextResponse } from "next/server";
import { getProjectBySlug, getProject, getProjectUsers } from "@/lib/fortytwo-api";

/**
 * GET /api/42/projects/[slug]/users
 * Fetches users who completed a project.
 *
 * Query params:
 * - page: page number (default: 1)
 * - per_page: items per page (default: 30, max: 100)
 * - campus: campus ID to filter by
 * - validated: whether to only show validated (default: true)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "30", 10),
      100
    );
    const campusId = searchParams.get("campus")
      ? parseInt(searchParams.get("campus")!, 10)
      : undefined;
    const validated = searchParams.get("validated") !== "false";

    // Check if slug is numeric (project ID)
    const isNumeric = /^\d+$/.test(slug);

    let projectId: number;

    if (isNumeric) {
      projectId = parseInt(slug, 10);
    } else {
      // Get project by slug first
      const project = await getProjectBySlug(slug);
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      projectId = project.id;
    }

    // Fetch users who completed the project
    const users = await getProjectUsers(projectId, {
      page,
      perPage,
      campusId,
      validated,
    });

    return NextResponse.json({
      users: users.map((pu) => ({
        id: pu.id,
        login: pu.user.login,
        displayName: pu.user.usual_full_name || `${pu.user.first_name} ${pu.user.last_name}`,
        avatarUrl: pu.user.image?.link || null,
        finalMark: pu.final_mark,
        validated: pu.validated ?? (pu.final_mark !== null && pu.final_mark >= 100),
        markedAt: pu.marked_at,
        campus: pu.user.campus?.[0] || null,
        level: pu.user.cursus_users?.find((cu) => cu.cursus_id === 21)?.level || null,
      })),
      pagination: {
        page,
        per_page: perPage,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch project users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project users from 42 API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
