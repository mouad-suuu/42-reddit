import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

/**
 * PATCH /api/projects/[slug]/posts/[postId]
 * Update a README post. Only the author can update.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const { slug, postId } = await params;

    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        project: {
          select: { slug: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify it's a README and belongs to the project
    if (post.type !== "README" || post.project.slug !== slug) {
      return NextResponse.json(
        { error: "Invalid post" },
        { status: 400 }
      );
    }

    // Verify ownership
    if (post.authorId !== authUser.user.id) {
      return NextResponse.json(
        { error: "You can only update your own README" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content } = body;

    if (title !== undefined && title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (content !== undefined && content.length > 50000) {
      return NextResponse.json(
        { error: "Content must be 50,000 characters or less" },
        { status: 400 }
      );
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
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
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    const score = updatedPost.votes.reduce((sum, vote) => sum + vote.value, 0);

    return NextResponse.json({
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        author: updatedPost.author,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        score,
        voteCount: updatedPost._count.votes,
      },
    });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[slug]/posts/[postId]
 * Delete a README post. Only the author can delete.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const { slug, postId } = await params;

    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        project: {
          select: { slug: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify it's a README and belongs to the project
    if (post.type !== "README" || post.project.slug !== slug) {
      return NextResponse.json(
        { error: "Invalid post" },
        { status: 400 }
      );
    }

    // Verify ownership
    if (post.authorId !== authUser.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own README" },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
