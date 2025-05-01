import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all posts by the current user
    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        meowedBy: {
          select: {
            id: true,
          },
        },
        views: {
          select: {
            id: true,
            deviceType: true,
            userId: true,
            visitorHash: true,
          },
        },
      },
    });
    
    // Calculate stats for each post
    const postStats = posts.map(post => {
      // Count unique visitors by combining user IDs and visitor hashes
      const uniqueVisitors = new Set();
      post.views.forEach(view => {
        if (view.userId) {
          uniqueVisitors.add(`user-${view.userId}`);
        } else if (view.visitorHash) {
          uniqueVisitors.add(`visitor-${view.visitorHash}`);
        }
      });
      
      const deviceStats = {
        desktop: post.views.filter(view => view.deviceType === 'desktop').length,
        mobile: post.views.filter(view => view.deviceType === 'mobile').length,
        tablet: post.views.filter(view => view.deviceType === 'tablet').length,
      };
      
      const userTypeStats = {
        authenticated: post.views.filter(view => view.userId !== null).length,
        anonymous: post.views.filter(view => view.userId === null).length,
      };
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        viewCount: post.viewCount || 0,
        uniqueViewCount: uniqueVisitors.size,
        meowCount: post.meowedBy.length,
        deviceStats,
        userTypeStats,
      };
    });
    
    // Calculate overall stats
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
    const totalMeows = posts.reduce((sum, post) => sum + post.meowedBy.length, 0);
    
    // Count unique visitors across all posts
    const allUniqueVisitors = new Set();
    posts.forEach(post => {
      post.views.forEach(view => {
        if (view.userId) {
          allUniqueVisitors.add(`user-${view.userId}`);
        } else if (view.visitorHash) {
          allUniqueVisitors.add(`visitor-${view.visitorHash}`);
        }
      });
    });
    const totalUniqueViews = allUniqueVisitors.size;
    
    // Device distribution
    const allViews = posts.flatMap(post => post.views);
    const deviceCounts = {
      desktop: allViews.filter(view => view.deviceType === 'desktop').length,
      mobile: allViews.filter(view => view.deviceType === 'mobile').length,
      tablet: allViews.filter(view => view.deviceType === 'tablet').length,
    };
    
    const deviceDistribution = [
      { name: 'Desktop', value: deviceCounts.desktop },
      { name: 'Mobile', value: deviceCounts.mobile },
      { name: 'Tablet', value: deviceCounts.tablet },
    ];
    
    // User type distribution
    const userTypeCounts = {
      authenticated: allViews.filter(view => view.userId !== null).length,
      anonymous: allViews.filter(view => view.userId === null).length,
    };
    
    const userTypeDistribution = [
      { name: 'Authenticated', value: userTypeCounts.authenticated },
      { name: 'Anonymous', value: userTypeCounts.anonymous },
    ];
    
    // Top posts by views
    const topPosts = [...posts]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .map(post => {
        // Count unique visitors for this post
        const uniqueVisitors = new Set();
        post.views.forEach(view => {
          if (view.userId) {
            uniqueVisitors.add(`user-${view.userId}`);
          } else if (view.visitorHash) {
            uniqueVisitors.add(`visitor-${view.visitorHash}`);
          }
        });
        
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          viewCount: post.viewCount || 0,
          uniqueViewCount: uniqueVisitors.size,
        };
      });
    
    const overallStats = {
      totalViews,
      totalUniqueViews,
      totalMeows,
      deviceDistribution,
      userTypeDistribution,
      topPosts,
    };
    
    return NextResponse.json({
      postStats,
      overallStats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}