import React, { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait a bit for navigation to be ready
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isLoggedIn && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/login');
    } else if (isLoggedIn && !inAuthGroup) {
      // Redirect to main app if authenticated and not in protected routes
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isNavigationReady]);

  return <>{children}</>;
}
