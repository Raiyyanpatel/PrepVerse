"use client";
import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  Video, 
  FileText, 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Brain, 
  Shield, 
  Search,
  Play,
  Clock,
  Users,
  Star,
  ExternalLink,
  Filter,
  Download,
  UserCheck,
  Target,
  BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LearningHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { name: 'All', icon: BookOpen, count: 40 },
    { name: 'Frontend', icon: Globe, count: 6 },
    { name: 'Backend', icon: Database, count: 5 },
    { name: 'Mobile', icon: Smartphone, count: 4 },
    { name: 'AI/ML', icon: Brain, count: 4 },
    { name: 'DevOps', icon: Shield, count: 5 },
    { name: 'DSA', icon: Code, count: 10 },
    { name: 'Career', icon: UserCheck, count: 4 },
    { name: 'Aptitude', icon: Target, count: 2 }
  ];

  const resources = [
    {
      id: 1,
      title: "Striver's SDE Sheet - Top Coding Interview Problems",
      description: "A structured and comprehensive DSA roadmap with curated questions for coding interviews. Complete list of 191 problems.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 15 min",
      level: "All Levels",
      rating: 4.9,
      students: 50000,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["DSA", "Interview", "Coding", "Problems", "SDE"],
      author: "Striver (Raj Vikramaditya)",
      isNew: false,
      link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/"
    },
    {
      id: 2,
      title: "Complete React.js Masterclass",
      description: "Learn React from basics to advanced concepts including hooks, context, and performance optimization.",
      category: "Frontend",
      type: "Video",
      duration: "12h 30m",
      level: "Beginner to Advanced",
      rating: 4.8,
      students: 1250,
      thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg",
      tags: ["React", "JavaScript", "Frontend", "Hooks"],
      author: "John Doe",
      isNew: true,
      link: "https://youtu.be/bMknfKXIFA8"
    },
    {
      id: 3,
      title: "Machine Learning Complete Playlist - Krish Naik",
      description: "Complete Machine Learning tutorial series covering all concepts from basics to advanced with practical projects and real-world examples.",
      category: "AI/ML",
      type: "Video",
      duration: "45h 20m",
      level: "Beginner to Advanced",
      rating: 4.9,
      students: 15000,
      thumbnail: "https://img.youtube.com/vi/JxgmHe2NyeY/maxresdefault.jpg",
      tags: ["Machine Learning", "Python", "AI", "Data Science", "Projects"],
      author: "Krish Naik",
      isNew: true,
      link: "https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe"
    },
    {
      id: 4,
      title: "Node.js & Express Backend Development",
      description: "Build scalable backend applications with Node.js, Express, and MongoDB.",
      category: "Backend",
      type: "Video",
      duration: "8h 45m",
      level: "Intermediate",
      rating: 4.7,
      students: 890,
      thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg",
      tags: ["Node.js", "Express", "MongoDB", "Backend"],
      author: "Jane Smith",
      isNew: false,
      link: "https://youtu.be/Oe421EPjeBE"
    },
    {
      id: 5,
      title: "Data Structures & Algorithms Complete Guide",
      description: "Comprehensive guide to DSA concepts with practical examples and coding problems. Master all important algorithms and data structures.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 2h 30m",
      level: "All Levels",
      rating: 4.9,
      students: 2100,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Algorithms", "Data Structures", "Problem Solving"],
      author: "Alex Johnson",
      isNew: false,
      link: "https://youtu.be/RBSGKlAvoiM"
    },
    {
      id: 6,
      title: "System Design Interview Preparation",
      description: "Complete guide to system design concepts for technical interviews at top companies. Learn scalability, load balancing, and more.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 1h 45m",
      level: "Intermediate to Advanced",
      rating: 4.7,
      students: 1500,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["System Design", "Interviews", "Scalability", "Architecture"],
      author: "Gaurav Sen",
      isNew: true,
      link: "https://youtu.be/bUHFg8CZFws"
    },
    {
      id: 7,
      title: "Flutter Mobile App Development",
      description: "Build beautiful cross-platform mobile apps with Flutter and Dart.",
      category: "Mobile",
      type: "Video",
      duration: "10h 15m",
      level: "Beginner to Intermediate",
      rating: 4.5,
      students: 650,
      thumbnail: "https://img.youtube.com/vi/1ukSR1GRtMU/maxresdefault.jpg",
      tags: ["Flutter", "Dart", "Mobile", "Cross-platform"],
      author: "Mike Chen",
      isNew: false,
      link: "https://youtu.be/1ukSR1GRtMU"
    },
    {
      id: 8,
      title: "Docker & Kubernetes DevOps",
      description: "Learn containerization and orchestration for modern application deployment.",
      category: "DevOps",
      type: "Video",
      duration: "6h 30m",
      level: "Intermediate to Advanced",
      rating: 4.8,
      students: 420,
      thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg",
      tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
      author: "Robert Taylor",
      isNew: false,
      link: "https://youtu.be/3c-iBn73dDE"
    },
    {
      id: 9,
      title: "JavaScript Complete Bootcamp",
      description: "Master JavaScript from fundamentals to advanced ES6+ features and DOM manipulation.",
      category: "Frontend",
      type: "Video",
      duration: "20h 45m",
      level: "Beginner to Advanced",
      rating: 4.9,
      students: 3200,
      thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
      tags: ["JavaScript", "ES6", "DOM", "Frontend"],
      author: "Jonas Schmedtmann",
      isNew: true,
      link: "https://youtu.be/PkZNo7MFNFg"
    },
    {
      id: 10,
      title: "Python Full Course for Beginners",
      description: "Complete Python programming course covering basics to advanced topics and real projects.",
      category: "Backend",
      type: "Video",
      duration: "12h 20m",
      level: "Beginner",
      rating: 4.8,
      students: 2800,
      thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg",
      tags: ["Python", "Programming", "Beginner", "Projects"],
      author: "Programming with Mosh",
      isNew: false,
      link: "https://youtu.be/_uQrJ0TkZlc"
    },
    {
      id: 11,
      title: "React Native Mobile Development",
      description: "Build native mobile apps for iOS and Android using React Native and JavaScript.",
      category: "Mobile",
      type: "Video",
      duration: "14h 10m",
      level: "Intermediate",
      rating: 4.6,
      students: 950,
      thumbnail: "https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg",
      tags: ["React Native", "Mobile", "iOS", "Android"],
      author: "Academind",
      isNew: false,
      link: "https://youtu.be/0-S5a0eXPoc"
    },
    {
      id: 12,
      title: "AWS Cloud Computing Fundamentals",
      description: "Learn Amazon Web Services from basics including EC2, S3, Lambda, and deployment strategies.",
      category: "DevOps",
      type: "Video",
      duration: "10h 35m",
      level: "Beginner to Intermediate",
      rating: 4.5,
      students: 1100,
      thumbnail: "https://img.youtube.com/vi/k1RI5locZE4/maxresdefault.jpg",
      tags: ["AWS", "Cloud", "EC2", "S3", "Lambda"],
      author: "FreeCodeCamp",
      isNew: false,
      link: "https://youtu.be/k1RI5locZE4"
    },
    {
      id: 13,
      title: "Deep Learning with TensorFlow",
      description: "Master deep learning concepts and build neural networks using TensorFlow and Keras.",
      category: "AI/ML",
      type: "Video",
      duration: "18h 50m",
      level: "Advanced",
      rating: 4.7,
      students: 680,
      thumbnail: "https://img.youtube.com/vi/tPYj3fFJGjk/maxresdefault.jpg",
      tags: ["TensorFlow", "Deep Learning", "Neural Networks", "AI"],
      author: "MIT OpenCourseWare",
      isNew: true,
      link: "https://youtu.be/tPYj3fFJGjk"
    },
    {
      id: 14,
      title: "Complete Web Development Roadmap 2024",
      description: "Step-by-step guide to becoming a full-stack web developer. Covers HTML, CSS, JavaScript, React, Node.js and more.",
      category: "Frontend",
      type: "Article",
      duration: "Read time: 45 min",
      level: "Beginner",
      rating: 4.6,
      students: 5200,
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Web Development", "Roadmap", "Full Stack", "Career"],
      author: "Tech Career Guide",
      isNew: true,
      link: "#"
    },
    {
      id: 15,
      title: "Competitive Programming Handbook",
      description: "Essential guide for competitive programming covering algorithms, data structures, and problem-solving techniques.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 3h 15m",
      level: "Intermediate to Advanced",
      rating: 4.8,
      students: 1800,
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Competitive Programming", "Algorithms", "Problem Solving"],
      author: "CP Community",
      isNew: false,
      link: "#"
    },
    {
      id: 16,
      title: "NeetCode - LeetCode Solutions",
      description: "Clear explanations of coding interview problems with visual diagrams and optimal solutions.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 5 min",
      level: "All Levels",
      rating: 4.9,
      students: 15000,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["LeetCode", "Coding Interview", "Algorithms", "DSA"],
      author: "NeetCode",
      isNew: true,
      link: "https://neetcode.io/"
    },
    {
      id: 17,
      title: "GeeksforGeeks Interview Preparation Roadmap",
      description: "Comprehensive roadmap for technical interview preparation covering all major topics.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 20 min",
      level: "Beginner",
      rating: 4.7,
      students: 8500,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Interview Prep", "Roadmap", "DSA", "GeeksforGeeks"],
      author: "GeeksforGeeks",
      isNew: false,
      link: "https://www.geeksforgeeks.org/blogs/interview-preparation-roadmap/"
    },
    {
      id: 18,
      title: "ATS Resume Checker",
      description: "Free tool to check if your resume is optimized for Applicant Tracking Systems (ATS).",
      category: "Career",
      type: "Tool",
      duration: "Use time: 10 min",
      level: "Beginner",
      rating: 4.5,
      students: 12000,
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Resume", "ATS", "Career", "Job Search"],
      author: "MyPerfectResume",
      isNew: true,
      link: "https://www.myperfectresume.com/resume/ats-resume-checker"
    },
    {
      id: 19,
      title: "IndiaBix - Aptitude & Technical Tests",
      description: "Practice aptitude, reasoning, and technical questions for interviews and competitive exams.",
      category: "Aptitude",
      type: "Article",
      duration: "Read time: 10 min",
      level: "All Levels",
      rating: 4.6,
      students: 25000,
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Aptitude", "Reasoning", "Technical Tests", "Competitive Exams"],
      author: "IndiaBix",
      isNew: false,
      link: "https://www.indiabix.com/"
    },
    {
      id: 20,
      title: "freeCodeCamp Web Development",
      description: "Complete full-stack web development curriculum with hands-on projects and certifications.",
      category: "Frontend",
      type: "Video",
      duration: "300h+",
      level: "Beginner to Advanced",
      rating: 4.8,
      students: 400000,
      thumbnail: "https://img.youtube.com/vi/zJSY8tbf_ys/maxresdefault.jpg",
      tags: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Full Stack"],
      author: "freeCodeCamp",
      isNew: true,
      link: "https://www.freecodecamp.org/"
    },
    {
      id: 21,
      title: "The Odin Project",
      description: "Free full-stack curriculum with projects to build your portfolio from scratch.",
      category: "Frontend",
      type: "Article",
      duration: "Read time: 30 min",
      level: "Beginner",
      rating: 4.9,
      students: 150000,
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Web Development", "Portfolio", "Projects", "Full Stack"],
      author: "The Odin Project",
      isNew: false,
      link: "https://www.theodinproject.com/"
    },
    {
      id: 22,
      title: "LeetCode Patterns Guide",
      description: "14 essential coding patterns that solve 80% of LeetCode problems with detailed explanations.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 2h 30m",
      level: "Intermediate",
      rating: 4.8,
      students: 45000,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["LeetCode", "Patterns", "Algorithms", "Coding Interview"],
      author: "Sean Prashad",
      isNew: true,
      link: "https://seanprashad.com/leetcode-patterns/"
    },
    {
      id: 23,
      title: "System Design Interview",
      description: "Comprehensive guide to system design interviews with real-world examples and case studies.",
      category: "Backend",
      type: "Article",
      duration: "Read time: 4h 15m",
      level: "Advanced",
      rating: 4.9,
      students: 35000,
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["System Design", "Architecture", "Scalability", "Interview"],
      author: "Alex Xu",
      isNew: false,
      link: "https://github.com/donnemartin/system-design-primer"
    },
    {
      id: 24,
      title: "Docker Complete Course",
      description: "Master containerization with Docker from basics to production deployment strategies.",
      category: "DevOps",
      type: "Video",
      duration: "6h 30m",
      level: "Beginner to Intermediate",
      rating: 4.7,
      students: 28000,
      thumbnail: "https://img.youtube.com/vi/fqMOX6JJhGo/maxresdefault.jpg",
      tags: ["Docker", "Containers", "DevOps", "Deployment"],
      author: "TechWorld with Nana",
      isNew: true,
      link: "https://youtu.be/fqMOX6JJhGo"
    },
    {
      id: 25,
      title: "React Native Complete Guide",
      description: "Build native mobile apps for iOS and Android using React Native with practical projects.",
      category: "Mobile",
      type: "Video",
      duration: "25h 45m",
      level: "Intermediate",
      rating: 4.6,
      students: 18000,
      thumbnail: "https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg",
      tags: ["React Native", "Mobile Development", "iOS", "Android"],
      author: "Maximilian Schwarzmüller",
      isNew: false,
      link: "https://youtu.be/0-S5a0eXPoc"
    },
    {
      id: 26,
      title: "Machine Learning Roadmap 2024",
      description: "Complete roadmap to become a machine learning engineer with resources and project ideas.",
      category: "AI/ML",
      type: "Article",
      duration: "Read time: 45 min",
      level: "Beginner",
      rating: 4.8,
      students: 52000,
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Machine Learning", "Roadmap", "AI", "Career Guide"],
      author: "ML Community",
      isNew: true,
      link: "https://whimsical.com/machine-learning-roadmap-2020-CA7f3ykvXpnJ9Az32vYXva"
    },
    {
      id: 27,
      title: "GitHub Student Developer Pack",
      description: "Free developer tools and resources for students including cloud credits and premium software.",
      category: "Career",
      type: "Tool",
      duration: "Use time: 15 min",
      level: "All Levels",
      rating: 4.9,
      students: 75000,
      thumbnail: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["GitHub", "Student", "Free Tools", "Developer Pack"],
      author: "GitHub Education",
      isNew: false,
      link: "https://education.github.com/pack"
    },
    {
      id: 28,
      title: "HackerRank Practice Problems",
      description: "Extensive collection of coding challenges across different domains and difficulty levels.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 20 min",
      level: "All Levels",
      rating: 4.7,
      students: 120000,
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Coding Challenges", "Practice", "Algorithms", "Data Structures"],
      author: "HackerRank",
      isNew: false,
      link: "https://www.hackerrank.com/domains/algorithms"
    },
    {
      id: 29,
      title: "AWS Cloud Practitioner Guide",
      description: "Complete guide to AWS fundamentals and cloud computing concepts for beginners.",
      category: "DevOps",
      type: "Article",
      duration: "Read time: 3h 20m",
      level: "Beginner",
      rating: 4.6,
      students: 38000,
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["AWS", "Cloud Computing", "Certification", "DevOps"],
      author: "AWS Training",
      isNew: true,
      link: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/"
    },
    {
      id: 30,
      title: "Flutter Development Bootcamp",
      description: "Build beautiful native apps for mobile, web, and desktop from a single codebase using Flutter.",
      category: "Mobile",
      type: "Video",
      duration: "31h 15m",
      level: "Beginner to Advanced",
      rating: 4.8,
      students: 95000,
      thumbnail: "https://img.youtube.com/vi/x0uinJvhNxI/maxresdefault.jpg",
      tags: ["Flutter", "Dart", "Cross Platform", "Mobile Development"],
      author: "Dr. Angela Yu",
      isNew: true,
      link: "https://youtu.be/x0uinJvhNxI"
    },
    {
      id: 31,
      title: "TensorFlow Machine Learning Course",
      description: "Hands-on machine learning course using TensorFlow with real-world projects and applications.",
      category: "AI/ML",
      type: "Video",
      duration: "18h 30m",
      level: "Intermediate",
      rating: 4.7,
      students: 42000,
      thumbnail: "https://img.youtube.com/vi/tPYj3fFJGjk/maxresdefault.jpg",
      tags: ["TensorFlow", "Deep Learning", "Neural Networks", "Python"],
      author: "TensorFlow Team",
      isNew: false,
      link: "https://youtu.be/tPYj3fFJGjk"
    },
    {
      id: 32,
      title: "Node.js Complete Guide",
      description: "Master backend development with Node.js, Express, MongoDB, and build REST APIs.",
      category: "Backend",
      type: "Video",
      duration: "42h 10m",
      level: "Intermediate",
      rating: 4.8,
      students: 67000,
      thumbnail: "https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg",
      tags: ["Node.js", "Express", "MongoDB", "REST API", "Backend"],
      author: "Jonas Schmedtmann",
      isNew: true,
      link: "https://youtu.be/fBNz5xF-Kx4"
    },
    {
      id: 33,
      title: "CSS Grid & Flexbox Mastery",
      description: "Complete guide to modern CSS layout techniques with practical examples and projects.",
      category: "Frontend",
      type: "Video",
      duration: "8h 45m",
      level: "Beginner to Intermediate",
      rating: 4.9,
      students: 34000,
      thumbnail: "https://img.youtube.com/vi/jV8B24rSN5o/maxresdefault.jpg",
      tags: ["CSS", "Grid", "Flexbox", "Layout", "Responsive Design"],
      author: "Kevin Powell",
      isNew: false,
      link: "https://youtu.be/jV8B24rSN5o"
    },
    {
      id: 34,
      title: "Interview Bit Programming Challenges",
      description: "Structured programming challenges designed specifically for technical interview preparation.",
      category: "DSA",
      type: "Article",
      duration: "Read time: 25 min",
      level: "Intermediate to Advanced",
      rating: 4.7,
      students: 89000,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Interview Preparation", "Coding Challenges", "Algorithms", "Data Structures"],
      author: "InterviewBit",
      isNew: false,
      link: "https://www.interviewbit.com/practice/"
    },
    {
      id: 35,
      title: "LinkedIn Learning Path Builder",
      description: "Create personalized learning paths and track progress across various tech skills and certifications.",
      category: "Career",
      type: "Tool",
      duration: "Use time: 20 min",
      level: "All Levels",
      rating: 4.5,
      students: 156000,
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["LinkedIn", "Learning Path", "Professional Development", "Certification"],
      author: "LinkedIn Learning",
      isNew: true,
      link: "https://www.linkedin.com/learning/"
    },
    {
      id: 36,
      title: "GATE Computer Science Preparation",
      description: "Comprehensive study material and practice questions for GATE CSE exam preparation.",
      category: "Aptitude",
      type: "Article",
      duration: "Read time: 1h 30m",
      level: "Advanced",
      rating: 4.6,
      students: 78000,
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["GATE", "Computer Science", "Competitive Exam", "Engineering"],
      author: "GATE Community",
      isNew: false,
      link: "https://www.geeksforgeeks.org/gate-cs-notes-gq/"
    },
    {
      id: 37,
      title: "Kubernetes in Action",
      description: "Deploy, manage, and scale containerized applications using Kubernetes in production environments.",
      category: "DevOps",
      type: "Video",
      duration: "12h 20m",
      level: "Intermediate to Advanced",
      rating: 4.8,
      students: 23000,
      thumbnail: "https://img.youtube.com/vi/X48VuDVv0do/maxresdefault.jpg",
      tags: ["Kubernetes", "Container Orchestration", "DevOps", "Production"],
      author: "TechWorld with Nana",
      isNew: true,
      link: "https://youtu.be/X48VuDVv0do"
    },
    {
      id: 38,
      title: "React Testing Library Guide",
      description: "Learn to write effective tests for React applications using Testing Library and Jest.",
      category: "Frontend",
      type: "Article",
      duration: "Read time: 2h 15m",
      level: "Intermediate",
      rating: 4.7,
      students: 31000,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["React", "Testing", "Jest", "Testing Library", "Unit Tests"],
      author: "Kent C. Dodds",
      isNew: false,
      link: "https://testing-library.com/docs/react-testing-library/intro/"
    },
    {
      id: 39,
      title: "GraphQL Complete Course",
      description: "Master GraphQL from basics to advanced concepts including Apollo Client and Server implementation.",
      category: "Backend",
      type: "Video",
      duration: "15h 40m",
      level: "Intermediate",
      rating: 4.6,
      students: 19000,
      thumbnail: "https://img.youtube.com/vi/ed8SzALpx1Q/maxresdefault.jpg",
      tags: ["GraphQL", "Apollo", "API", "Backend Development"],
      author: "Ben Awad",
      isNew: true,
      link: "https://youtu.be/ed8SzALpx1Q"
    },
    {
      id: 40,
      title: "Data Structures Visualizer",
      description: "Interactive tool to visualize and understand how different data structures work step by step.",
      category: "DSA",
      type: "Tool",
      duration: "Use time: 30 min",
      level: "All Levels",
      rating: 4.9,
      students: 67000,
      thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
      tags: ["Data Structures", "Visualization", "Interactive", "Learning Tool"],
      author: "VisuAlgo Team",
      isNew: true,
      link: "https://visualgo.net/"
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button className="btn-secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="icon-container-green">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Learning Hub</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="modern-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-container-blue">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">12+</div>
                <div className="text-slate-500 text-sm">Video Courses</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-container-green">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">6+</div>
                <div className="text-slate-500 text-sm">Categories</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-container-purple">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">15K+</div>
                <div className="text-slate-500 text-sm">Students</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-container-orange">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">4.7</div>
                <div className="text-slate-500 text-sm">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm opacity-75">{category.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Resources */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedCategory === 'All' ? 'All Resources' : `${selectedCategory} Resources`}
                <span className="text-slate-500 text-lg ml-2">({filteredResources.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <a 
                  key={resource.id} 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="modern-card overflow-hidden transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-2xl">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={resource.thumbnail} 
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          resource.type === 'Video' 
                            ? 'bg-rose-100 text-rose-700 border-rose-200' 
                            : resource.type === 'Article'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : resource.type === 'Tool'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {resource.type}
                        </span>
                      </div>

                      {/* New Badge */}
                      {resource.isNew && (
                        <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-semibold border bg-amber-100 text-amber-800 border-amber-200">NEW</div>
                      )}

                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {resource.duration}
                      </div>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm shadow">
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {resource.title}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2 mt-1" />
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {resource.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {resource.students.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          {resource.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {resource.level}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="text-slate-500 text-xs px-2 py-1">
                            +{resource.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {resource.author.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-slate-900 font-medium text-sm">{resource.author}</div>
                            <div className="text-slate-500 text-xs">{resource.category}</div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          className="btn-primary"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="modern-card text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No resources found</h3>
                <p className="text-slate-600">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHubPage;
