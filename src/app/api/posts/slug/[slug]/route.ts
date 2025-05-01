import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            meowedBy: true
          }
        }
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Add meowCount to the response
    const postWithMeowCount = {
      ...post,
      meowCount: post._count.meowedBy
    };
    
    // Remove _count from the response
    delete postWithMeowCount._count;

    return NextResponse.json({ post: postWithMeowCount });
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the post" },
      { status: 500 }
    );
  }
}