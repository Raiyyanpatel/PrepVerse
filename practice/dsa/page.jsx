"use client";
import React, { useEffect, useState } from 'react';
import { Code2, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DSAPracticePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load');
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="icon-container-blue">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">DSA Practice</h1>
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" /> Questions
            </h2>
          </div>

          {error && (
            <div className="history-card border border-red-100 bg-red-50 text-red-700 p-3 mb-4 rounded-xl">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="history-card animate-pulse h-16" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map((q) => (
                <Link key={q.question_id} href={`/practice/dsa/${q.question_id}`} className="history-card hover-lift group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-800">{q.title}</div>
                      <div className="text-xs text-slate-500 mt-1">Difficulty: {q.difficulty}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </Link>
              ))}
              {!items.length && (
                <div className="history-card">No questions found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
