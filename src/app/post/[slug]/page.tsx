'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Heading from '@tiptap/extension-heading';
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import Head from 'next/head';

type Post = {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [meowed, setMeowed] = useState(false);
  const [meowCount, setMeowCount] = useState(0);
  const [isMeowLoading, setIsMeowLoading] = useState(false);
  
  // Update document title when post is loaded
  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} | B-lol-g`;
    }
  }, [post]);

  // Fetch post data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the current post
        const postResponse = await fetch(`/api/posts/slug/${slug}`);
        
        if (!postResponse.ok) {
          if (postResponse.status === 404) {
            router.push('/404');
            return;
          }
          const errorData = await postResponse.json();
          throw new Error(errorData.message || 'Failed to fetch post');
        }
        
        const postData = await postResponse.json();
        setPost(postData.post);
        
        // Track post view
        const userAgent = navigator.userAgent;
        const deviceType = getDeviceType(userAgent);
        
        await fetch('/api/posts/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: postData.post.id,
            deviceType,
          }),
        });
        
        // Fetch related posts
        const relatedResponse = await fetch(`/api/posts/related/${slug}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedPosts(relatedData.posts);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to fetch post');
        }
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, router]);

  // Helper function to determine device type
  const getDeviceType = (userAgent: string): string => {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    if (/ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  };

  // Fetch meow status when post is loaded
  useEffect(() => {
    const fetchMeowStatus = async () => {
      if (!post || status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/posts/meow/status?postId=${post.id}`);
        if (response.ok) {
          const data = await response.json();
          setMeowed(data.meowed);
          setMeowCount(data.meowCount);
        }
      } catch (error) {
        console.error("Error fetching meow status:", error);
      }
    };

    fetchMeowStatus();
  }, [post, status]);

  // Add audio refs for meow and unmeow sounds
  const meowSoundRef = useRef<HTMLAudioElement | null>(null);
  const unmeowSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio elements on component mount
  useEffect(() => {
    meowSoundRef.current = new Audio('/sounds/meow.mp3');
    unmeowSoundRef.current = new Audio('/sounds/unmeow.mp3');
    
    // Clean up audio elements on unmount
    return () => {
      if (meowSoundRef.current) {
        meowSoundRef.current.pause();
        meowSoundRef.current = null;
      }
      if (unmeowSoundRef.current) {
        unmeowSoundRef.current.pause();
        unmeowSoundRef.current = null;
      }
    };
  }, []);

  // Handle meow/unmeow action
  const handleMeowAction = async () => {
    if (!post || status !== 'authenticated') {
      if (status !== 'authenticated') {
        toast({
          title: "Authentication Required",
          description: "Please log in to meow this post",
          variant: "destructive",
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push(`/login?callbackUrl=/post/${slug}`);
        }, 1500);
      }
      return;
    }
    
    setIsMeowLoading(true);
    
    try {
      const action = meowed ? 'unmeow' : 'meow';
      const response = await fetch('/api/posts/meow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          action,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeowed(data.meowed);
        setMeowCount(data.meowCount);
        
        // Play the appropriate sound effect
        if (data.meowed && meowSoundRef.current) {
          meowSoundRef.current.currentTime = 0;
          meowSoundRef.current.play().catch(err => console.error("Error playing meow sound:", err));
        } else if (!data.meowed && unmeowSoundRef.current) {
          unmeowSoundRef.current.currentTime = 0;
          unmeowSoundRef.current.play().catch(err => console.error("Error playing unmeow sound:", err));
        }
        
        toast({
          title: data.meowed ? "Meow!" : "Unmeowed",
          description: data.meowed ? "You meowed this post" : "You unmeowed this post",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process meow action');
      }
    } catch (error) {
      console.error("Error handling meow action:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process meow action",
        variant: "destructive",
      });
    } finally {
      setIsMeowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // Format date for display
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contentHTML = post ? generateHTML(JSON.parse(post.content), [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Heading.configure({
      levels: [1, 2, 3], 
    }),
    LinkExtension.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary hover:underline',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto',
      },
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: 'Write your post content here...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'rounded-md bg-muted p-4 my-4 overflow-x-auto',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse table-auto w-full my-4',
      },
    }),
    TableRow,
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-muted p-2',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-muted bg-muted font-bold p-2',
      },
    }),]) : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden audio elements for sounds */}
      <audio src="/sounds/meow.mp3" preload="auto" id="meowSound" />
      <audio src="/sounds/unmeow.mp3" preload="auto" id="unmeowSound" />
      
      {/* Hero Section with Post Title */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10 ">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/posts" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to all posts
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-muted-foreground">
                By {post.author.name} · {formattedDate}
              </p>
              <div className="flex items-center ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${meowed ? 'text-pink-500' : ''}`}
                  onClick={handleMeowAction}
                  disabled={isMeowLoading}
                >
                  {meowed ? (
                    <HeartSolidIcon className="h-5 w-5 text-pink-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span>{meowCount} Meow{meowCount !== 1 ? 's' : ''}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary bodyViewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
        
        {/* Meow button at the end of the post */}
        <div className="max-w-3xl mx-auto mt-12 flex justify-center">
          <Button
            variant={meowed ? "default" : "outline"}
            size="lg"
            className={`flex items-center gap-2 ${meowed ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
            onClick={handleMeowAction}
            disabled={isMeowLoading}
          >
            {meowed ? (
              <HeartSolidIcon className="h-6 w-6" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
            <span>{meowed ? 'Meowed!' : 'Meow this post'}</span>
            {meowCount > 0 && <span className="ml-1">({meowCount})</span>}
          </Button>
        </div>
      </section>

      {/* Related Posts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">You Might Also Like</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.length > 0 ? (
              relatedPosts.map((relatedPost) => (
                <motion.div 
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                      <Link href={`/post/${relatedPost.slug}`}>{relatedPost.title}</Link>
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      By {relatedPost.author.name} · {new Date(relatedPost.createdAt).toLocaleDateString()}
                    </p>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/post/${relatedPost.slug}`}>Read More</Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No related posts found</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}