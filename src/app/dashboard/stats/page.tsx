'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardShell from '@/components/dashboard-shell';
import { Skeleton } from '@/components/ui/skeleton';

type PostStats = {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  uniqueViewCount: number;
  meowCount: number;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  userTypeStats: {
    authenticated: number;
    anonymous: number;
  };
};

type OverallStats = {
  totalViews: number;
  totalUniqueViews: number;
  totalMeows: number;
  deviceDistribution: {
    name: string;
    value: number;
  }[];
  userTypeDistribution: {
    name: string;
    value: number;
  }[];
  topPosts: {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    uniqueViewCount: number;
  }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [postStats, setPostStats] = useState<PostStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setPostStats(data.postStats);
        setOverallStats(data.overallStats);
        
        if (data.postStats.length > 0) {
          setSelectedPostId(data.postStats[0].id);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const selectedPost = postStats.find(post => post.id === selectedPostId);
  
  const deviceData = selectedPost ? [
    { name: 'Desktop', value: selectedPost.deviceStats.desktop },
    { name: 'Mobile', value: selectedPost.deviceStats.mobile },
    { name: 'Tablet', value: selectedPost.deviceStats.tablet },
  ] : [];
  
  const userTypeData = selectedPost ? [
    { name: 'Authenticated', value: selectedPost.userTypeStats.authenticated },
    { name: 'Anonymous', value: selectedPost.userTypeStats.anonymous },
  ] : [];
  
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Post Analytics</h1>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-[200px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overallStats?.totalViews || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Unique Views</CardTitle>
                    <CardDescription>Based on unique visitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overallStats?.totalUniqueViews || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Meows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overallStats?.totalMeows || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Top Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overallStats?.topPosts[0] ? (
                      <>
                        <div className="text-xl font-medium mb-1 truncate">{overallStats.topPosts[0].title}</div>
                        <div className="text-muted-foreground">{overallStats.topPosts[0].viewCount} views</div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">No posts yet</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>Views by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overallStats?.deviceDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {overallStats?.deviceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Type Distribution</CardTitle>
                    <CardDescription>Views by user authentication status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overallStats?.userTypeDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {overallStats?.userTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Posts</CardTitle>
                  <CardDescription>Posts with the most views</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={overallStats?.topPosts.slice(0, 5).map(post => ({
                          name: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
                          views: post.viewCount,
                          uniqueViews: post.uniqueViewCount,
                        })) || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#8884d8" name="Total Views" />
                        <Bar dataKey="uniqueViews" fill="#82ca9d" name="Unique Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select a Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedPostId || ''}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                  >
                    {postStats.map(post => (
                      <option key={post.id} value={post.id}>
                        {post.title} ({post.viewCount} views, {post.uniqueViewCount} unique)
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
              
              {selectedPost && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                        <CardDescription>Views by device type for selected post</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={deviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {deviceData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>User Type Distribution</CardTitle>
                        <CardDescription>Views by user authentication status for selected post</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={userTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {userTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Post Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Title:</span>
                          <span>{selectedPost.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total Views:</span>
                          <span>{selectedPost.viewCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Unique Views:</span>
                          <span>{selectedPost.uniqueViewCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Meows:</span>
                          <span>{selectedPost.meowCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Slug:</span>
                          <span>{selectedPost.slug}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}