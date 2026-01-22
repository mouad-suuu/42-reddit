import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getFullUserById } from "@/lib/fortytwo-api";

/**
 * GET /api/projects/[slug]/posts
 * List all README posts for a project, sorted by vote score.
 * Includes completion status for each author.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find project
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, fortyTwoProjectId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get README posts with vote counts and author info
    const posts = await prisma.post.findMany({
      where: {
        projectId: project.id,
        type: "README",
      },
      include: {
        author: {
          select: {
            id: true,
            intraLogin: true,
            intraId: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        votes: {
          select: {
            value: true,
            userId: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate vote scores and check completion status
    const postsWithScores = await Promise.all(
      posts.map(async (post: typeof posts[number]) => {
        const score = post.votes.reduce((sum: number, vote: { value: number }) => sum + vote.value, 0);

        // Check if author completed this project (has a note/grade)
        let hasCompleted = false;
        if (post.author.intraId && project.fortyTwoProjectId) {
          try {
            const userData = await getFullUserById(post.author.intraId);
            const projectUser = userData.projects_users?.find(
              (pu) => pu.project.id === project.fortyTwoProjectId && pu.status === "finished"
            );
            hasCompleted = !!projectUser && (projectUser["validated?"] === true);
          } catch (err) {
            // If we can't fetch, assume not completed
            console.warn(`Could not check completion for user ${post.author.intraId}:`, err);
          }
        }

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          score,
          voteCount: post._count.votes,
          hasCompleted,
        };
      })
    );

    // Sort by score (highest first)
    postsWithScores.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    return NextResponse.json({ posts: postsWithScores });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[slug]/posts
 * Create or update a README post. One README per user per project.
 * If user already has a README, returns existing one with a flag.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find project
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user already has a README for this project
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: authUser.user.id,
        projectId: project.id,
        type: "README",
      },
    });

    if (existingPost) {
      return NextResponse.json(
        {
          error: "You already have a README for this project. Please update or delete it first.",
          existingPost: {
            id: existingPost.id,
            title: existingPost.title,
            content: existingPost.content,
          },
        },
        { status: 409 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (content.length > 50000) {
      return NextResponse.json(
        { error: "Content must be 50,000 characters or less" },
        { status: 400 }
      );
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        projectId: project.id,
        authorId: authUser.user.id,
        type: "README",
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            intraLogin: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        score: 0,
        voteCount: 0,
      },
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
