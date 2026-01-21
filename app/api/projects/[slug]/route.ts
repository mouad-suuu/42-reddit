import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectCategory } from "@prisma/client";

/**
 * GET /api/projects/[slug]
 * Fetches a project from the database by slug.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        fortyTwoProjectId: true,
        category: true,
        circle: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[slug]
 * Updates a project's category and/or circle.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate category if provided
    if (body.category && !Object.values(ProjectCategory).includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: NEW_CORE, OLD_CORE, PISCINE, OTHER" },
        { status: 400 }
      );
    }

    // Validate circle if provided
    if (body.circle !== undefined) {
      const validCircles = [-1, 0, 1, 2, 3, 4, 5, 6, 13];
      if (!validCircles.includes(body.circle)) {
        return NextResponse.json(
          { error: "Invalid circle. Must be -1, 0-6, or 13" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: { category?: ProjectCategory; circle?: number } = {};
    if (body.category) updateData.category = body.category;
    if (body.circle !== undefined) updateData.circle = body.circle;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { slug },
      data: updateData,
      select: {
        id: true,
        slug: true,
        title: true,
        fortyTwoProjectId: true,
        category: true,
        circle: true,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
