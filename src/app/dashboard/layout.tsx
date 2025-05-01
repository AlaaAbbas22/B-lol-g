"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// The authorized email that can access the dashboard
const AUTHORIZED_EMAIL = 'alaa@uni.minerva.edu';





export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait until session status is determined
    if (status === 'loading') {
      return; // Do nothing while loading
    }

    // If unauthenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // If authenticated, check if the email matches the authorized email
    if (status === 'authenticated') {
      if (session?.user?.email !== AUTHORIZED_EMAIL) {
        // If email doesn't match, redirect to home or an unauthorized page
        console.warn(`Unauthorized access attempt by ${session?.user?.email}`);
        router.push('/'); // Or redirect to a specific '/unauthorized' page
      }
      // If email matches, allow access (do nothing, render children)
    }
  }, [status, session, router]);

  // Show loading state or nothing while checking session
  if (status === 'loading' || (status === 'authenticated' && session?.user?.email !== AUTHORIZED_EMAIL)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Optional: Add a loading indicator */}
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Render children only if authenticated and authorized
  if (status === 'authenticated' && session?.user?.email === AUTHORIZED_EMAIL) {
    return <>{children}</>;
  }

  // Fallback case (should ideally not be reached due to redirects)
  return null;
}
