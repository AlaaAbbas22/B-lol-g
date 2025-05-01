import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

export async function POST(request: Request) {
  try {
    const { postId, deviceType } = await request.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email || null;
    
    // Get IP address from headers
    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Create a hashed identifier for anonymous users
    const visitorId = userId || createHash('sha256').update(ip).digest('hex');
    
    // Check if the post belongs to the current user
    if (userId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { 
          author: {
            select: { email: true }
          }
        }
      });
      
      // Skip recording view if the viewer is the author
      if (post?.author?.email === userEmail) {
        return NextResponse.json({ success: true, skipped: true });
      }
    }
    
    // Check if this visitor has already viewed this post in the last 24 hours
    const lastDayView = await prisma.postView.findFirst({
      where: {
        postId,
        OR: [
          { userId: userId },
          { visitorHash: userId ? undefined : visitorId }
        ],
        viewedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    // If already viewed in last 24 hours, don't count as a new view
    if (lastDayView) {
      return NextResponse.json({ success: true, skipped: true });
    }
    
    // Create a view record
    await prisma.postView.create({
      data: {
        postId,
        userId,
        visitorHash: userId ? undefined : visitorId,
        deviceType,
        ipAddress: userId ? undefined : ip, // Only store IP for anonymous users
        viewedAt: new Date(),
      },
    });
    
    // Update the post's view count
    await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking post view:', error);
    return NextResponse.json(
      { error: 'Failed to track post view' },
      { status: 500 }
    );
  }
}