import { NextResponse } from "next/server";
import { getFullUserByLogin, getFullUserById } from "@/lib/fortytwo-api";
import { syncDiscoveredProjects, extractProjectsFromUserData } from "@/lib/project-sync";

/**
 * GET /api/42/users/[login]
 * Fetches a user's full 42 profile by their login or ID.
 * Public endpoint - no authentication required.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;

    if (!login) {
      return NextResponse.json(
        { error: "Login is required" },
        { status: 400 }
      );
    }

    let fullUser;

    // Check if it's a numeric ID
    if (/^\d+$/.test(login)) {
      fullUser = await getFullUserById(parseInt(login, 10));
    } else {
      fullUser = await getFullUserByLogin(login);
    }

    if (!fullUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Ensure arrays exist (some users may lack certain data)
    const cursusUsers = fullUser.cursus_users || [];
    const projectsUsers = fullUser.projects_users || [];
    const achievements = fullUser.achievements || [];
    const campuses = fullUser.campus || [];

    // Get the main cursus (42cursus, id=21)
    const mainCursus = cursusUsers.find((cu) => cu.cursus_id === 21);

    // Filter projects to get in-progress ones (not finished)
    const inProgressProjects = projectsUsers
      .filter((pu) => pu.status !== "finished" && pu.cursus_ids.includes(21))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // Get finished projects for the main cursus
    const finishedProjects = projectsUsers
      .filter((pu) => pu.status === "finished" && pu.cursus_ids.includes(21))
      .sort((a, b) => new Date(b.marked_at || b.updated_at).getTime() - new Date(a.marked_at || a.updated_at).getTime());

    // Sync discovered projects to database (async, non-blocking)
    syncDiscoveredProjects(extractProjectsFromUserData(projectsUsers)).catch((err) => {
      console.error("Failed to sync projects:", err);
    });

    return NextResponse.json({
      user: {
        id: fullUser.id,
        login: fullUser.login,
        displayName: fullUser.displayname,
        firstName: fullUser.first_name,
        lastName: fullUser.last_name,
        avatarUrl: fullUser.image?.link || null,
        avatarVersions: fullUser.image?.versions || null,
        location: fullUser.location,
        correctionPoints: fullUser.correction_point,
        wallet: fullUser.wallet,
        poolMonth: fullUser.pool_month,
        poolYear: fullUser.pool_year,
        campus: campuses[0] || null,
      },
      cursus: mainCursus
        ? {
            level: mainCursus.level,
            grade: mainCursus.grade,
            blackholedAt: mainCursus.blackholed_at,
            skills: mainCursus.skills,
          }
        : null,
      inProgressProjects: inProgressProjects.map((pu) => ({
        id: pu.id,
        projectId: pu.project.id,
        name: pu.project.name,
        slug: pu.project.slug,
        status: pu.status,
        teamId: pu.current_team_id,
        occurrence: pu.occurrence,
        createdAt: pu.created_at,
        updatedAt: pu.updated_at,
      })),
      finishedProjects: finishedProjects.slice(0, 10).map((pu) => ({
        id: pu.id,
        projectId: pu.project.id,
        name: pu.project.name,
        slug: pu.project.slug,
        finalMark: pu.final_mark,
        validated: pu["validated?"],
        markedAt: pu.marked_at,
        occurrence: pu.occurrence,
      })),
      achievements: achievements.filter((a) => a.visible).slice(0, 20),
      stats: {
        totalProjects: projectsUsers.filter((pu) => pu.cursus_ids.includes(21)).length,
        finishedProjects: finishedProjects.length,
        inProgressProjects: inProgressProjects.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user profile from 42 API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
