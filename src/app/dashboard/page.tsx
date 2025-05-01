'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch posts when session is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      fetchPosts();
    }
  }, [status, session]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/posts/user', {
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch posts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      
      // Update the state after successful deletion
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to delete post');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Writer Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your blog posts and create new content</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/create">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-center p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Slug: {post.slug}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/post/${post.slug}`}>
                          <ArrowRightIcon className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/edit/${post.id}`}>
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="text-center py-12 bg-card rounded-lg border border-border p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4">No posts yet</h3>
              <p className="text-muted-foreground mb-6">Create your first blog post to get started</p>
              <Button asChild>
                <Link href="/dashboard/create">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}