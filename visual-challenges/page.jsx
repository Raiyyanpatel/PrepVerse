"use client";
import React from 'react';
import { BrainCircuit, ArrowLeft, Video } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function VisualChallengesPage() {
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
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-2xl shadow-lg">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">Visual Challenges</h1>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="modern-card p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">AI Visual Challenges Coming Soon!</h2>
            <p className="text-xl text-slate-600 mb-8">
              Revolutionary AI-powered visual problem solving:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="feature-card hover-lift">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">🎨 AI-Generated Problems</h3>
                <p className="text-slate-600 text-sm">Unique visual challenges created by AI</p>
              </div>
              <div className="feature-card hover-lift">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">📊 Interactive Diagrams</h3>
                <p className="text-slate-600 text-sm">Dynamic visual problem representation</p>
              </div>
              <div className="feature-card hover-lift">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">🔍 Pattern Recognition</h3>
                <p className="text-slate-600 text-sm">Test your visual problem-solving skills</p>
              </div>
              <div className="feature-card hover-lift">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">🎯 Adaptive Difficulty</h3>
                <p className="text-gray-300 text-sm">Challenges that adapt to your skill level</p>
              </div>
            </div>

            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Try AI Mock Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualChallengesPage;
