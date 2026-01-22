import { NextResponse } from "next/server";
import { getProjectBySlug, getProjectUsers, getCampuses } from "@/lib/fortytwo-api";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/42/projects/[slug]/users
 * Fetches users who completed a project.
 *
 * Query params:
 * - page: page number (default: 1)
 * - per_page: items per page (default: 30, max: 100)
 * - campus: campus name or ID to filter by (if not provided, uses current user's campus)
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
    const validated = searchParams.get("validated") !== "false";
    const sort = searchParams.get("sort") || "-updated_at";
    const online = searchParams.get("online") === "true";

    // If filtering by online status, fetch max allowed pages to increase hit rate
    const effectivePerPage = online ? 100 : perPage;

    console.log(`[API] Fetching users for slug ${slug}, sort: ${sort}, online: ${online}`);

    // Get campus filter
    let campusId: number | undefined;
    const campusParam = searchParams.get("campus");

    if (campusParam) {
      // If it's numeric, treat as ID
      if (/^\d+$/.test(campusParam)) {
        campusId = parseInt(campusParam, 10);
      } else {
        // Otherwise, look up by name
        const campuses = await getCampuses();
        const campus = campuses.find((c) => c.name === campusParam);
        if (campus) {
          campusId = campus.id;
        }
      }
    } else {
      // If no campus specified, try to use current user's campus
      const authUser = await getAuthUser();
      if (authUser?.user?.campus) {
        const campuses = await getCampuses();
        const campus = campuses.find((c) => c.name === authUser.user!.campus);
        if (campus) {
          campusId = campus.id;
        }
      }
    }

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
    try {
      const users = await getProjectUsers(projectId, {
        page,
        perPage: effectivePerPage,
        campusId,
        validated,
        sort,
      });

      // If filtering by online, remove users without location
      // Logs for debugging
      if (online) {
        console.log(`[API] Filtering online users. Total fetched: ${users.length}`);
      }

      const filteredUsers = online
        ? users.filter(u => u.user.location !== null && u.user.location !== "")
        : users;

      if (online) {
        console.log(`[API] Users with location: ${filteredUsers.length}`);
      }

      return NextResponse.json({
        users: filteredUsers.map((pu) => ({
          id: pu.id,
          login: pu.user.login,
          displayName: pu.user.usual_full_name || `${pu.user.first_name} ${pu.user.last_name}`,
          avatarUrl: pu.user.image?.link || null,
          finalMark: pu.final_mark,
          validated: pu.validated ?? (pu.final_mark !== null && pu.final_mark >= 100),
          markedAt: pu.marked_at,
          campus: pu.user.campus?.[0] || null,
          location: pu.user.location || null,
          level: pu.user.cursus_users?.find((cu) => cu.cursus_id === 21)?.level || null,
        })),
        pagination: {
          page,
          per_page: perPage,
          total: filteredUsers.length,
        },
      });
    } catch (error) {
      // Handle rate limiting gracefully
      if (error instanceof Error && error.message.includes("429")) {
        console.warn("42 API rate limit exceeded, returning empty list");
        return NextResponse.json({
          users: [],
          pagination: {
            page,
            per_page: perPage,
            total: 0,
          },
          rateLimited: true,
        });
      }
      // For other errors, also return empty array gracefully
      console.error("Failed to fetch project users:", error);
      return NextResponse.json({
        users: [],
        pagination: {
          page,
          per_page: perPage,
          total: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    // Outer catch for any unexpected errors
    console.error("Unexpected error in project users route:", error);
    return NextResponse.json({
      users: [],
      pagination: {
        page: 1,
        per_page: 20,
        total: 0,
      },
      error: "Unexpected error occurred",
    });
  }
}
