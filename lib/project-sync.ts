import { prisma } from "./prisma";

interface ProjectToSync {
  id: number;
  name: string;
  slug: string;
}

/**
 * Syncs discovered projects to the database.
 * New projects are added with category=OTHER (to be manually curated later).
 * Returns the count of newly added projects.
 */
export async function syncDiscoveredProjects(
  projects: ProjectToSync[]
): Promise<{ added: number; existing: number }> {
  if (projects.length === 0) {
    return { added: 0, existing: 0 };
  }

  // Get unique projects by 42 API ID
  const uniqueProjects = Array.from(
    new Map(projects.map((p) => [p.id, p])).values()
  );

  // Check which projects already exist
  const existingProjectIds = await prisma.project.findMany({
    where: {
      fortyTwoProjectId: { in: uniqueProjects.map((p) => p.id) },
    },
    select: { fortyTwoProjectId: true },
  });

  const existingIds = new Set(existingProjectIds.map((p) => p.fortyTwoProjectId));

  // Filter to only new projects
  const newProjects = uniqueProjects.filter((p) => !existingIds.has(p.id));

  if (newProjects.length === 0) {
    return { added: 0, existing: uniqueProjects.length };
  }

  // Insert new projects
  await prisma.project.createMany({
    data: newProjects.map((p) => ({
      slug: p.slug,
      title: p.name,
      fortyTwoProjectId: p.id,
      // category defaults to OTHER
    })),
    skipDuplicates: true, // In case of race conditions on slug
  });

  return { added: newProjects.length, existing: existingIds.size };
}

/**
 * Extracts project info from user's projects_users array.
 */
export function extractProjectsFromUserData(
  projectsUsers: { project: { id: number; name: string; slug: string } }[]
): ProjectToSync[] {
  return projectsUsers.map((pu) => ({
    id: pu.project.id,
    name: pu.project.name,
    slug: pu.project.slug,
  }));
}
