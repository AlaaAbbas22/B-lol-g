"use client";
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { generateHTML } from "@tiptap/html";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
  };
};

type PaginationType = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function PostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts?page=${currentPage}`);
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [currentPage]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Articles</h1>
            <p className="text-muted-foreground text-lg">
              Explore our collection of articles on web development, design, and technology
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          <Link href={`/post/${post.slug}`} className="hover:underline">
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          By {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div dangerouslySetInnerHTML={{ 
                          __html: (generateHTML(JSON.parse(post.content), [
                            StarterKit,
                            LinkExtension,
                            Image,
                            CodeBlockLowlight.configure({ lowlight })
                          ])) || ''
                        }} className="prose dark:prose-invert max-w-none line-clamp-3" />
                       </CardContent>
                      <CardFooter>
                        <Button asChild variant="ghost" className="w-full">
                          <Link href={`/post/${post.slug}`}>
                            Read More <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <div className="flex justify-center mt-12 space-x-2">
                  {pagination.hasPrevPage && (
                    <Button asChild variant="outline">
                      <Link href={`/posts?page=${pagination.currentPage - 1}`}>
                        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Previous
                      </Link>
                    </Button>
                  )}
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page}
                      asChild
                      variant={page === pagination.currentPage ? "default" : "outline"}
                    >
                      <Link href={`/posts?page=${page}`}>
                        {page}
                      </Link>
                    </Button>
                  ))}
                  
                  {pagination.hasNextPage && (
                    <Button asChild variant="outline">
                      <Link href={`/posts?page=${pagination.currentPage + 1}`}>
                        Next <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold mb-4">No articles found</h3>
              <p className="text-muted-foreground mb-8">Check back soon for new content!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}