import { prisma } from "./prisma";
import { ProjectCategory } from "@prisma/client";

interface ProjectToSync {
  id: number;
  name: string;
  slug: string;
  cursusIds: number[];
}

/**
 * Determines the category of a project based on its slug and cursus.
 * Piscine projects have cursus_id=9 or slug containing "piscine".
 */
function detectProjectCategory(project: ProjectToSync): ProjectCategory {
  const slugLower = project.slug.toLowerCase();
  
  // Piscine projects (cursus_id 9 or slug contains "piscine")
  if (project.cursusIds.includes(9) || slugLower.includes("piscine")) {
    return "PISCINE";
  }
  
  // Default to OTHER - will be manually curated to NEW_CORE or OLD_CORE
  return "OTHER";
}

/**
 * Syncs discovered projects to the database.
 * Simply inserts new projects without fetching descriptions.
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

  // Check which projects already exist (by fortyTwoProjectId OR slug)
  const existingProjects = await prisma.project.findMany({
    where: {
      OR: [
        { fortyTwoProjectId: { in: uniqueProjects.map((p) => p.id) } },
        { slug: { in: uniqueProjects.map((p) => p.slug) } },
      ],
    },
    select: { fortyTwoProjectId: true, slug: true },
  });

  const existingIds = new Set(existingProjects.map((p) => p.fortyTwoProjectId));
  const existingSlugs = new Set(existingProjects.map((p) => p.slug));

  // Filter to only truly new projects
  const newProjects = uniqueProjects.filter(
    (p) => !existingIds.has(p.id) && !existingSlugs.has(p.slug)
  );

  if (newProjects.length === 0) {
    return { added: 0, existing: uniqueProjects.length };
  }

  // Use createMany with skipDuplicates for batch insert
  const result = await prisma.project.createMany({
    data: newProjects.map((project) => ({
      slug: project.slug,
      title: project.name,
      fortyTwoProjectId: project.id,
      category: detectProjectCategory(project),
    })),
    skipDuplicates: true,
  });

  console.log(`[Sync] Inserted ${result.count} new projects`);

  return { added: result.count, existing: existingProjects.length };
}

/**
 * Extracts project info from user's projects_users array.
 */
export function extractProjectsFromUserData(
  projectsUsers: { 
    project: { id: number; name: string; slug: string };
    cursus_ids: number[];
  }[]
): ProjectToSync[] {
  return projectsUsers.map((pu) => ({
    id: pu.project.id,
    name: pu.project.name,
    slug: pu.project.slug,
    cursusIds: pu.cursus_ids,
  }));
}
