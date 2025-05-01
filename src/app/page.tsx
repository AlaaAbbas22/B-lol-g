"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EarthCanvas from "@/components/Earth"; // Import the EarthCanvas component
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image2 from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);

function Home() {
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    // Fetch posts when component mounts
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        if (response.ok) {
          setLatestPosts(data.posts);
        } else {
          console.error('Failed to fetch posts:', data.error);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  // Debugging: Display the number of posts fetched
  console.log('Latest Posts:', latestPosts);

  // Define animation variants
  const heroVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.3 } },
    hover: { scale: 1.05 }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    hover: { scale: 1.02 }
  };

  const buttonVariants = {
    hover: { scale: 1.1, rotate: 5 }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero Section with Split Layout */}
      <section className="relative h-[90vh] overflow-hidden z-10 flex">
        {/* Left Content */}
        <div className="w-1/2 relative z-10 flex flex-col justify-center px-8 lg:px-12">
          <motion.div 
            className="max-w-xl"
            initial="initial"
            animate="animate"
            variants={heroVariants}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              variants={heroVariants}
            >
              B-lol-g
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80 mb-8"
              variants={heroVariants}
            >
              Welcome to my blog. I am Alaa (lol). I found current blog apps such so I created my own awesome blog.
            </motion.p>
            <motion.div
              whileHover="hover"
              variants={buttonVariants}
            >
              <Button asChild size="lg" variant="glass">
                <Link href="/posts">
                  Explore Articles <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Earth Canvas */}
        <div className="hidden md:block w-1/2 relative">
          <motion.div 
            className="absolute inset-0 z-0 bg-transparent"
            initial="initial"
            animate="animate"
            variants={heroVariants}
          >
            <div className="w-full h-full " />
          </motion.div>
          <div className="relative h-full">
            <EarthCanvas />
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <Button asChild variant="outline">
              <Link href="/posts">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.length > 0 ? (
              latestPosts.map((post) => (
                <motion.div 
                  key={post.id || post._id} // Ensure key is unique
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  variants={cardVariants}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        <Link href={`/post/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        By {post.author?.name || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <div dangerouslySetInnerHTML={{ 
                          __html: (generateHTML(JSON.parse(post.content), [
                            StarterKit,
                            LinkExtension,
                            Image2,
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No articles yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section with Glassmorphism */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={heroVariants}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Subscribe to our Newsletter</h2>
            <p className="text-center text-muted-foreground mb-6">
              Stay updated with the latest articles and news from our blog
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow h-12 px-4 rounded-md border border-input bg-background/50" 
                required 
              />
              <motion.div whileHover="hover" variants={buttonVariants}>
                <Button type="submit" size="lg">
                  Subscribe
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
