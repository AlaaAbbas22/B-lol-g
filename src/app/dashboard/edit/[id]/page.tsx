'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PostForm } from "@/components/post/post-form";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState({});
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch post data on component mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch post');
        }
        
        const data = await response.json();
        setTitle(data.post.title);
        setSlug(data.post.slug);
        
        // Handle content based on its format
        let postContent = data.post.content;
        try {
          // Try to parse content if it's a JSON string
          if (typeof postContent === 'string') {
            const parsedContent = JSON.parse(postContent);
            if (parsedContent && typeof parsedContent === 'object') {
              postContent = parsedContent;
            }
          }
        } catch (e) {
          // If parsing fails, use content as is (string)
          console.log("Content is not in JSON format, using as plain text");
        }
        console.log(postContent)
        // Set content and initial content for editor
        setContent(postContent);
        setInitialContent(postContent);
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

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the post');
      }
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-4">Edit Post</h1>
          </div>

          <PostForm
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            initialContent={initialContent}
            onContentChange={setContent}
            isSubmitting={isSaving}
            error={error}
            onSubmit={handleSubmit}
            submitButtonText="Save Changes"
            cancelButton={
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            }
          />
        </motion.div>
      </div>
    </div>
  );
}