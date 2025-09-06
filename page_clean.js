"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Code2, 
  BrainCircuit, 
  Video, 
  BookOpen, 
  Target, 
  Users,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  MonitorSpeaker,
  FileText,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="modern-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="icon-container-blue">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                PrepVerse
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {isClient && isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="achievement-badge">
                    🎓 Welcome Back
                  </div>
                  <UserButton />
                </div>
              ) : isClient ? (
                <Link href="/sign-in">
                  <Button className="btn-primary">
                    Get Started Free
                  </Button>
                </Link>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <div className="slide-in-up mb-12">
            <div className="inline-block mb-6">
              <span className="achievement-badge text-lg px-6 py-3">
                🚀 #1 AI-Powered Interview Platform
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-slate-800 mb-8 leading-tight">
              Master Your
              <span className="text-gradient-blue block float-animation"> Dream Interview</span>
            </h1>
            <p className="text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your interview skills with AI-powered practice sessions, 
              personalized feedback, and comprehensive preparation tools. 
              <strong>Join 50,000+ successful candidates!</strong>
            </p>
          </div>
          
          <div className="flex justify-center mb-16">
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-xl px-12 py-6 rounded-3xl font-bold"
            >
              View Features
            </button>
          </div>
        </div>
      </section>

      {/* Modern Statistics Section */}
      <section id="stats" className="py-20 px-4 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Practice Questions Stat */}
            <div className="stat-card hover-lift bounce-in">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gradient-blue mb-2">10,000+</div>
              <div className="text-slate-700 font-semibold text-lg mb-4">Practice Questions</div>
              <div className="progress-container">
                <div className="progress-bar-blue w-full"></div>
              </div>
            </div>

            {/* Companies Covered Stat */}
            <div className="stat-card hover-lift bounce-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gradient-green mb-2">500+</div>
              <div className="text-slate-700 font-semibold text-lg mb-4">Companies Covered</div>
              <div className="progress-container">
                <div className="progress-bar-green w-4/5"></div>
              </div>
            </div>

            {/* Success Rate Stat */}
            <div className="stat-card hover-lift bounce-in" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-3 rounded-full">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gradient-orange mb-2">95%</div>
              <div className="text-slate-700 font-semibold text-lg mb-4">Success Rate</div>
              <div className="progress-container">
                <div className="progress-bar-orange w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 section-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="achievement-badge text-base px-4 py-2">
                ✨ Premium Features
              </span>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600">Comprehensive tools for your tech career preparation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* DSA Practice */}
            <Link href="/practice/dsa" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="icon-container-blue mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <Code2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">DSA Practice</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Solve coding problems with our IDE, multiple test cases, and company-wise question categorization.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Multiple programming languages</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Real-time code execution</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Company-wise filtering</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Advanced Level</span>
                </div>
              </div>
            </Link>

            {/* AI Mock Interviews */}
            <Link href="/dashboard" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="icon-container-purple mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <MonitorSpeaker className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">AI Mock Interviews</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Practice with AI interviewer that analyzes your responses, emotions, and provides confidence scores.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Voice & emotion analysis</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Real-time feedback</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Confidence scoring</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Pro Level</span>
                </div>
              </div>
            </Link>

            {/* Learning Hub */}
            <Link href="/learn" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="icon-container-green mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Learning Hub</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Comprehensive learning materials with videos, articles, and topic-wise content for all domains.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />HD video tutorials</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Detailed documentation</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Topic-wise organization</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Beginner Friendly</span>
                </div>
              </div>
            </Link>

            {/* Interview Questions Bank */}
            <Link href="/interview-prep" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="icon-container-orange mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Interview Prep</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Access 1000+ questions per topic across Web Dev, Mobile Dev, ML/AI, and Blockchain.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />AI-generated questions</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Detailed sample answers</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Topic-wise categorization</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Expert Level</span>
                </div>
              </div>
            </Link>

            {/* Resume Review */}
            <Link href="/resume-reviewer" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Resume Review</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Get AI-powered resume analysis with suggestions for improvement and ATS optimization.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />ATS compatibility check</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Content optimization</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Format improvements</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Professional</span>
                </div>
              </div>
            </Link>

            {/* Visual Challenges */}
            <Link href="/visual-challenges" className="block">
              <div className="feature-card hover-glow h-full">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Visual Challenges</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Interactive coding challenges with visual feedback and step-by-step problem solving.
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Interactive visualizations</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Step-by-step solutions</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Real-time feedback</li>
                </ul>
                <div className="mt-6">
                  <span className="level-badge">Interactive</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-800 mb-4">
              How PrepVerse Works
            </h2>
            <p className="text-xl text-slate-600">
              Your journey to interview success in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="icon-container-blue mx-auto mb-6">
                <Target className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">1. Choose Your Path</h3>
              <p className="text-slate-600 leading-relaxed">
                Select from DSA practice, mock interviews, learning resources, or resume review based on your career goals.
              </p>
            </div>

            <div className="text-center">
              <div className="icon-container-purple mx-auto mb-6">
                <BrainCircuit className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">2. Practice with AI</h3>
              <p className="text-slate-600 leading-relaxed">
                Engage with our AI-powered platform that provides real-time feedback, emotion analysis, and personalized guidance.
              </p>
            </div>

            <div className="text-center">
              <div className="icon-container-green mx-auto mb-6">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">3. Track Progress</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor your improvement with detailed analytics, confidence scores, and progress tracking across all areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of successful candidates who transformed their careers with PrepVerse
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="btn-secondary text-xl px-12 py-6 rounded-3xl font-bold">
                Start Your Journey Today
              </Button>
            </Link>
            <Link href="/learn">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xl px-12 py-6 rounded-3xl font-bold transition-all">
                Explore Learning Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="icon-container-blue mr-4">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">PrepVerse</h3>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Empowering careers through AI-powered interview preparation. Master your skills, boost your confidence, and land your dream job.
              </p>
              <div className="flex space-x-4">
                <div className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-white">🌟</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-white">💼</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-white">🚀</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">AI Mock Interviews</Link></li>
                <li><Link href="/practice/dsa" className="hover:text-white transition-colors">DSA Practice</Link></li>
                <li><Link href="/interview-prep" className="hover:text-white transition-colors">Interview Prep</Link></li>
                <li><Link href="/resume-reviewer" className="hover:text-white transition-colors">Resume Review</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/learn" className="hover:text-white transition-colors">Learning Hub</Link></li>
                <li><Link href="/visual-challenges" className="hover:text-white transition-colors">Visual Challenges</Link></li>
                <li><Link href="/proctored-practice" className="hover:text-white transition-colors">Proctored Practice</Link></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2025 PrepVerse. All rights reserved. Made with ❤️ for aspiring developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
