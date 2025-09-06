'use client';
import { UserButton } from '@clerk/nextjs'
import React, { useEffect } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import Interviewlist from './_components/Interviewlist'
import mediaManager from '@/utils/mediaManager'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Home, Sparkles, Target, TrendingUp, BrainCircuit } from 'lucide-react'

function Dashboard() {
  // Ensure media is cleaned up when arriving at dashboard
  useEffect(() => {
    mediaManager.setInterviewActive(false);
    mediaManager.cleanupAll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-5 md:mx-20 lg:mx-36 py-8">
        {/* Header Section */}
        <div className="modern-nav rounded-2xl mb-8 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button className="btn-secondary flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="icon-container-blue">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gradient-blue">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="achievement-badge">
                🎓 Learning Dashboard
              </div>
              <UserButton />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="modern-card p-8 mb-8 slide-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-4xl text-slate-800 mb-3">
                Welcome to Interview Prep 🚀
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                🎯 Create and start your AI-powered mock interviews to ace your next job opportunity. 
                Track your progress and improve with personalized feedback.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="icon-container-purple">
                <Sparkles className="h-12 w-12 text-white float-animation" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card hover-lift bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="icon-container-green">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">🎯 Ready to Practice</h3>
            <p className="text-slate-600">Start your interview journey</p>
            <div className="progress-container mt-4">
              <div className="progress-bar-green w-4/5"></div>
            </div>
          </div>
          
          <div className="stat-card hover-lift bounce-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-center mb-4">
              <div className="icon-container-purple">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">📈 Track Progress</h3>
            <p className="text-slate-600">Monitor your improvement</p>
            <div className="progress-container mt-4">
              <div className="progress-bar-blue w-3/4"></div>
            </div>
          </div>
          
          <div className="stat-card hover-lift bounce-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-center mb-4">
              <div className="icon-container-orange">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">✨ AI Feedback</h3>
            <p className="text-slate-600">Get personalized insights</p>
            <div className="progress-container mt-4">
              <div className="progress-bar-orange w-5/6"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <AddNewInterview/>
        </div>
        
        {/* Previous Interview list */}
        <Interviewlist/>
      </div>
    </div>
  )
}

export default Dashboard

