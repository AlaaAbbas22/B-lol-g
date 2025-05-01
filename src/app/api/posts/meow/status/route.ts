import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET endpoint to check if user has meowed a post
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { meowed: false, meowCount: 0, authenticated: false },
        { status: 200 }
      );
    }

    // Get postId from URL
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { message: "Missing postId parameter" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Check if post exists and get meow count
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        meowCount: true,
        meowedBy: {
          where: {
            id: userId
          },
          select: {
            id: true
          }
        }
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if user has meowed this post
    const meowed = post.meowedBy.length > 0;
    
    return NextResponse.json({ 
      meowed,
      meowCount: post.meowCount,
      authenticated: true
    });
    
  } catch (error) {
    console.error("Error checking meow status:", error);
    return NextResponse.json(
      { message: "An error occurred while checking meow status" },
      { status: 500 }
    );
  }
}