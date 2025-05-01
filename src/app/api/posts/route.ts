import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";

// Define the authorized email that can modify posts
const AUTHORIZED_EMAIL = 'alaa@uni.minerva.edu';

// Define validation schema for post creation
const postCreateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  content: z.union([
    z.string().min(10, { message: "Content must be at least 10 characters long" }),
    z.object({
      type: z.string(),
      content: z.array(z.any())
    }).refine(obj => {
      // Basic validation to ensure the content structure is not empty
      return obj.content && obj.content.length > 0;
    }, { message: "Content cannot be empty" })
  ]),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must contain only lowercase letters, numbers, and hyphens" 
    }),
});

// Helper function to check if user is authorized to modify posts
async function isAuthorized() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === AUTHORIZED_EMAIL;
}

// GET handler to fetch all posts (public access)
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}

// POST handler to create a new post (protected)
export async function POST(req: Request) {
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
    const result = postCreateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, content, slug } = result.data;
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (existingPost) {
      return NextResponse.json(
        { message: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id as string;
    
    // Create new post
    const post = await prisma.post.create({
      data: {
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        slug,
        authorId: userId,
      },
    });
    
    return NextResponse.json(
      {
        message: "Post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the post" },
      { status: 500 }
    );
  }
}