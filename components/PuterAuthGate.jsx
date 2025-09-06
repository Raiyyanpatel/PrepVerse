"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function PuterAuthGate() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const attemptedRef = useRef(false);

  const ensurePuterLoaded = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    if (window.puter?.auth?.getUser) return true;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://js.puter.com/v2/';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(s);
    });
    return !!window.puter?.auth?.getUser;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (attemptedRef.current) return;
      attemptedRef.current = true;
      try {
        const ok = await ensurePuterLoaded();
        setLoaded(ok);
        if (!ok) return;
        const user = await window.puter.auth.getUser();
        setShowPrompt(!user);
      } catch (e) {
        console.warn('Puter auth check failed:', e);
      }
    };
    run();
  }, [ensurePuterLoaded]);

  const onSignIn = useCallback(async () => {
    if (!loaded) return;
    try {
      setLoading(true);
      await window.puter.auth.signIn(); // must be inside user gesture
      const user = await window.puter.auth.getUser();
      if (user) {
        setShowPrompt(false);
        toast.success('Signed in to Puter.');
      } else {
        toast.error('Puter sign-in was cancelled. Some features may be unavailable.');
      }
    } catch (e) {
      console.error('Puter sign-in failed:', e);
      toast.error('Failed to sign in to Puter.');
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3">
      <span>Sign in to Puter to enable AI features.</span>
      <button
        onClick={onSignIn}
        disabled={loading}
        className={`px-3 py-1 rounded bg-white text-blue-700 font-medium ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  );
}
