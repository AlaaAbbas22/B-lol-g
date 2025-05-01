import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { slug } = params;

    // Get the current post to exclude it
    const currentPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get 3 most recent posts excluding the current one
    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: currentPost.id }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ posts: relatedPosts });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
}