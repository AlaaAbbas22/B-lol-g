'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import cat from "../../public/cat.jpg";
import { Tooltip } from 'radix-ui';

export function Navbar(props) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("The B-lol-G");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  const toRotate = ["The B-lol-G", "The Blog", "The Awesome Blog"];
  const period = 2000;
  
  useEffect(() => {
    const ticker = setTimeout(() => {
      const i = loopNum % toRotate.length;
      const fullText = toRotate[i];
      
      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );
      
      setTypingSpeed(isDeleting ? 100 : 150);
      
      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), period);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);
    
    return () => clearTimeout(ticker);
  }, [text, isDeleting, loopNum, typingSpeed, toRotate]);
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      
    >
      <div className="container flex h-16 p-10 items-center justify-between min-w-[98vw]">
        <div className="flex items-center gap-6 md:gap-10 min-w-[180px]">
          <Link href="/" className="flex items-center space-x-2">
            <motion.span 
              className="hidden font-bold sm:inline-block text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {text}<span className="animate-pulse">|</span>
            </motion.span>
          </Link>
          
        </div>
        <nav className="hidden gap-6 md:flex">
            <Link 
              href="/posts/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-foreground' : 'text-foreground/60'}`}
            >
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                  <img 
                    src={cat.src} 
                    alt="Cat logo" 
                    className="h-[100px] fixed top-0 left-1/2 -translate-x-1/2 hover:h-[300px] transition-all duration-300" 
                  />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="TooltipContent" sideOffset={5}>
                      Go to my posts
                      <Tooltip.Arrow className="TooltipArrow" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
             
            </Link>
            
          </nav>
        <div className="flex items-center gap-4">
          {/*<ThemeToggle />*/}
          {status === 'authenticated' ? (
            <div className="flex items-center gap-4">
              {session?.user?.email === 'alaa@uni.minerva.edu' && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}