import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

interface CommentWithReplies {
  id: string;
  content: string;
  author: {
    id: string;
    intraLogin: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  score: number;
  voteCount: number;
  replies: CommentWithReplies[];
}

/**
 * Recursively builds a comment tree from flat comments.
 */
function buildCommentTree(
  comments: any[],
  parentId: string | null = null
): CommentWithReplies[] {
  return comments
    .filter((c) => c.parentCommentId === parentId)
    .map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      score: comment.votes.reduce((sum: number, v: any) => sum + v.value, 0),
      voteCount: comment._count.votes,
      replies: buildCommentTree(comments, comment.id),
    }))
    .sort((a, b) => b.score - a.score); // Sort by score
}

/**
 * GET /api/projects/[slug]/comments
 * List all comments for a project as a threaded tree.
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
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all comments for this project (flat list)
    const comments = await prisma.comment.findMany({
      where: {
        projectId: project.id,
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
        createdAt: "asc",
      },
    });

    // Build threaded tree
    const commentTree = buildCommentTree(comments, null);

    return NextResponse.json({ comments: commentTree });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[slug]/comments
 * Create a new comment or reply. Requires authentication.
 * Body: { content: string, parentCommentId?: string }
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

    // Parse request body
    const body = await request.json();
    const { content, parentCommentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: "Content must be 10,000 characters or less" },
        { status: 400 }
      );
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { id: true, projectId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Ensure parent belongs to the same project
      if (parentComment.projectId !== project.id) {
        return NextResponse.json(
          { error: "Parent comment belongs to a different project" },
          { status: 400 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        projectId: project.id,
        authorId: authUser.user.id,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
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
      comment: {
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        score: 0,
        voteCount: 0,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
