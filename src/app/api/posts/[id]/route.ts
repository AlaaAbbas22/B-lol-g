import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";

// Define the authorized email that can modify posts
const AUTHORIZED_EMAIL = 'alaa@uni.minerva.edu';

// Define validation schema for post updates
const postUpdateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }).optional(),
  content: z.union([
    z.string().min(10, { message: "Content must be at least 10 characters long" }),
    z.object({
      type: z.string(),
      content: z.array(z.any())
    }).refine(obj => {
      // Basic validation to ensure the content structure is not empty
      return obj.content && obj.content.length > 0;
    }, { message: "Content cannot be empty" })
  ]).optional(),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must contain only lowercase letters, numbers, and hyphens" 
    }).optional(),
});

// Helper function to check if user is authorized to modify posts
async function isAuthorized() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === AUTHORIZED_EMAIL;
}

// GET handler to fetch a specific post (public access)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the post" },
      { status: 500 }
    );
  }
}

// PUT handler to update a post (protected)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authorization
    if (!await isAuthorized()) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const result = postUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, content, slug } = result.data;
    
    // If slug is being updated, check if it already exists
    if (slug) {
      const existingPost = await prisma.post.findFirst({
        where: { 
          slug,
          id: { not: params.id }
        },
      });
      
      if (existingPost) {
        return NextResponse.json(
          { message: "A post with this slug already exists" },
          { status: 409 }
        );
      }
    }
    
    // Update post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { 
          content: typeof content === 'string' ? content : JSON.stringify(content) 
        }),
        ...(slug && { slug }),
      },
    });
    
    return NextResponse.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the post" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a post (protected)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authorization
    if (!await isAuthorized()) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });
    
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }
    
    // Delete post
    await prisma.post.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the post" },
      { status: 500 }
    );
  }
}