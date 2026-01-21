import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getFullUserById, getFullUserByLogin } from "@/lib/fortytwo-api";
import { syncDiscoveredProjects, extractProjectsFromUserData } from "@/lib/project-sync";

/**
 * GET /api/42/me
 * Fetches the current user's full 42 profile including:
 * - projects_users (all projects with status)
 * - cursus_users (cursus progress)
 * - achievements
 * - campus info
 * 
 * Requires authentication.
 */
export async function GET() {
  try {
    // Get current authenticated user
    const authUser = await getAuthUser();

    if (!authUser || !authUser.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user's 42 ID from their profile (stored in authUser.user)
    const fortyTwoUserId = authUser.user.intraId;
    const intraLogin = authUser.user.intraLogin;

    let fullUser;

    if (fortyTwoUserId) {
      // Fetch by ID (more reliable)
      fullUser = await getFullUserById(fortyTwoUserId);
    } else {
      // Fallback to login
      fullUser = await getFullUserByLogin(intraLogin);
    }

    if (!fullUser) {
      return NextResponse.json(
        { error: "Could not find your 42 profile" },
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
    // This adds any new projects to our DB for the projects listing page
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
        email: fullUser.email,
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
        error: "Failed to fetch your profile from 42 API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
