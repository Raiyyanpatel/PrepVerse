// Global Media Manager for Interview System
// This utility ensures camera and microphone are properly managed across the application

class MediaManager {
  constructor() {
    this.activeStreams = new Set();
    this.audioContexts = new Set();
    this.intervals = new Set();
    this.isInterviewActive = false;
  }

  // Register a media stream
  registerStream(stream) {
    if (stream) {
      this.activeStreams.add(stream);
    }
  }

  // Register an audio context
  registerAudioContext(context) {
    if (context) {
      this.audioContexts.add(context);
    }
  }

  // Register an interval
  registerInterval(intervalId) {
    if (intervalId) {
      this.intervals.add(intervalId);
    }
  }

  // Set interview state
  setInterviewActive(active) {
    this.isInterviewActive = active;
    console.log(`Interview state: ${active ? 'ACTIVE' : 'INACTIVE'}`);
  }

  // Check if currently in interview
  isInInterview() {
    return this.isInterviewActive;
  }

  // Cleanup all media resources
  cleanupAll() {
    console.log('Global media cleanup initiated...');
    
    // Stop all media streams
    this.activeStreams.forEach(stream => {
      try {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    });
    this.activeStreams.clear();

    // Close all audio contexts
    this.audioContexts.forEach(context => {
      try {
        if (context.state !== 'closed') {
          context.close();
          console.log('Closed audio context');
        }
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
    });
    this.audioContexts.clear();

    // Clear all intervals
    this.intervals.forEach(intervalId => {
      try {
        clearInterval(intervalId);
        console.log('Cleared interval');
      } catch (error) {
        console.error('Error clearing interval:', error);
      }
    });
    this.intervals.clear();

    this.isInterviewActive = false;
    console.log('Global media cleanup completed');
  }

  // Force cleanup (for navigation events)
  forceCleanup() {
    console.log('Force cleanup triggered');
    this.cleanupAll();
  }
}

// Create singleton instance
const mediaManager = new MediaManager();

// Global cleanup function for page navigation
if (typeof window !== 'undefined') {
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    mediaManager.forceCleanup();
  });

  // Cleanup on navigation (using Page Visibility API)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !mediaManager.isInInterview()) {
      mediaManager.forceCleanup();
    }
  });

  // Cleanup on route changes (for Next.js)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    const url = args[2];
    if (url && !url.includes('/interview/') && !url.includes('/start')) {
      mediaManager.forceCleanup();
    }
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    const url = args[2];
    if (url && !url.includes('/interview/') && !url.includes('/start')) {
      mediaManager.forceCleanup();
    }
    return originalReplaceState.apply(this, args);
  };
}

export default mediaManager;
