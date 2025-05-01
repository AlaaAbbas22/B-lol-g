import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// Define the authorized email that can access user posts
const AUTHORIZED_EMAIL = 'alaa@uni.minerva.edu';

// Helper function to check if user is authorized
async function isAuthorized() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === AUTHORIZED_EMAIL;
}

// GET handler to fetch posts for the current user (protected)
export async function GET() {
  try {
    // Check authorization
    if (!await isAuthorized()) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session!.user!.id as string;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching user posts" },
      { status: 500 }
    );
  }
}