'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mediaManager from '@/utils/mediaManager';

// Global navigation guard for media cleanup
export default function MediaCleanupGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Cleanup on initial load if not on interview page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/interview/') || !currentPath.includes('/start')) {
      mediaManager.setInterviewActive(false);
      mediaManager.cleanupAll();
    }

    // Override router navigation to ensure cleanup
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = function(href, options) {
      // Cleanup if navigating away from interview
      if (typeof href === 'string' && !href.includes('/interview/') && !href.includes('/start')) {
        mediaManager.setInterviewActive(false);
        mediaManager.cleanupAll();
      }
      return originalPush.call(this, href, options);
    };

    router.replace = function(href, options) {
      // Cleanup if navigating away from interview
      if (typeof href === 'string' && !href.includes('/interview/') && !href.includes('/start')) {
        mediaManager.setInterviewActive(false);
        mediaManager.cleanupAll();
      }
      return originalReplace.call(this, href, options);
    };

    return () => {
      // Restore original functions
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  return children;
}
