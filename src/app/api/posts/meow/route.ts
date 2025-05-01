import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// POST endpoint to meow or unmeow a post
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { postId, action } = body;
    
    if (!postId || !['meow', 'unmeow'].includes(action)) {
      return NextResponse.json(
        { message: "Invalid request. Requires postId and action (meow/unmeow)" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if user has already meowed this post
    const userMeowed = await prisma.post.findFirst({
      where: {
        id: postId,
        meowedBy: {
          some: {
            id: userId
          }
        }
      }
    });
    
    if (action === 'meow' && !userMeowed) {
      // Add meow
      await prisma.post.update({
        where: { id: postId },
        data: {
          meowCount: { increment: 1 },
          meowedBy: {
            connect: { id: userId }
          }
        }
      });
      
      return NextResponse.json({ 
        message: "Post meowed successfully",
        meowed: true,
        meowCount: post.meowCount + 1
      });
    } 
    else if (action === 'unmeow' && userMeowed) {
      // Remove meow
      await prisma.post.update({
        where: { id: postId },
        data: {
          meowCount: { decrement: 1 },
          meowedBy: {
            disconnect: { id: userId }
          }
        }
      });
      
      return NextResponse.json({ 
        message: "Post unmeowed successfully",
        meowed: false,
        meowCount: post.meowCount - 1
      });
    }
    
    // If no action was taken (already meowed/unmeowed)
    return NextResponse.json({ 
      message: action === 'meow' ? "Post already meowed" : "Post not meowed yet",
      meowed: action === 'meow',
      meowCount: post.meowCount
    });
    
  } catch (error) {
    console.error("Error handling meow action:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}