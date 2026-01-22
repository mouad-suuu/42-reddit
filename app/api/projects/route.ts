import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectCategory } from "@prisma/client";

/**
 * GET /api/projects
 * Lists projects from the database with optional filtering.
 * Query params: category, circle, search, page, per_page
 * - circle: filter by circle number (0-6, 13 for no-circle). Only shows circle >= 0 by default.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") as ProjectCategory | null;
    const circleParam = searchParams.get("circle");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "50", 10), 500);

    // Build where clause
    const where: {
      category?: ProjectCategory | { not: ProjectCategory };
      circle?: number | { gte: number };
      OR?: { title: { contains: string; mode: "insensitive" } }[];
    } = {};

    if (category && Object.values(ProjectCategory).includes(category)) {
      where.category = category;
    } else {
      // When no category specified (All), exclude PISCINE
      where.category = { not: "PISCINE" };
    }

    // Filter by circle - if specific circle requested, use it; otherwise show all >= 0
    if (circleParam !== null) {
      const circle = parseInt(circleParam, 10);
      if (!isNaN(circle)) {
        where.circle = circle;
      }
    } else {
      // Default: only show projects with assigned circles (>= 0)
      where.circle = { gte: 0 };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.project.count({ where });

    // Get projects
    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ circle: "asc" }, { title: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
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

    return NextResponse.json({
      projects,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
