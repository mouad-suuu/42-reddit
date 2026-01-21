import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectCategory } from "@prisma/client";

/**
 * GET /api/projects
 * Lists projects from the database with optional filtering.
 * Query params: category (NEW_CORE|OLD_CORE|OTHER), search, page, per_page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") as ProjectCategory | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "50", 10), 100);

    // Build where clause
    const where: {
      category?: ProjectCategory;
      OR?: { title: { contains: string; mode: "insensitive" } }[];
    } = {};

    if (category && Object.values(ProjectCategory).includes(category)) {
      where.category = category;
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
      orderBy: { title: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        fortyTwoProjectId: true,
        category: true,
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
