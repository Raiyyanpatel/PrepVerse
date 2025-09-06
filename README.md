# 🚀 PrepVerse - AI-Powered Interview & Coding Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)

> 🎯 **Master Your Dream Interview** - A comprehensive AI-powered platform for interview preparation, DSA practice, and coding assessment with real-time feedback and analytics.

## ✨ Features

### 🎪 **AI Mock Interviews**
- **Real-time AI Interviewer** powered by Google Gemini
- **Emotion & Focus Analysis** with webcam monitoring
- **Tab Switch Detection** for interview integrity
- **Voice Analysis** with confidence scoring
- **Personalized Feedback** with improvement suggestions
- **Question Bank** across Web Dev, Mobile, ML/AI, Blockchain

### 💻 **DSA Practice Platform**
- **Monaco Editor Integration** (VS Code-like experience)
- **Multi-language Support** (JavaScript, Python, Java, C++, C)
- **Judge0 Integration** for real-time code execution
- **Hidden Test Cases** with comprehensive verdict system
- **Theme Support** (Light, Dark, High Contrast)
- **Run & Submit** with detailed performance metrics

### 📚 **Learning Hub**
- **HD Video Tutorials** with topic-wise organization
- **Interactive Documentation** 
- **Comprehensive Learning Paths**
- **Progress Tracking**

### 📄 **Resume Reviewer**
- **AI-powered Analysis** with ATS optimization
- **Content Suggestions** for improvement
- **Format Recommendations**
- **Industry-specific Guidelines**

### 📰 **Latest Tech Updates**
- **Daily Tech Pulse** powered by Gemini AI
- **Manual Refresh System** (no auto-refresh spam)
- **Curated News** across AI, Cloud, Web, Mobile
- **Fallback Sources** for reliability

### 🔍 **Interview Preparation**
- **1000+ Questions** per technology domain
- **AI-generated Sample Answers**
- **Topic-wise Categorization**
- **Difficulty-based Filtering**

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router) 
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Shadcn/UI
- **Code Editor**: Monaco Editor (VS Code engine)
- **Icons**: Lucide React
- **Notifications**: Sonner

### **Backend & Database**
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM with direct SQL
- **Authentication**: Clerk (Social + Email)
- **Code Execution**: Judge0 via RapidAPI

### **AI & ML**
- **LLM**: Google Gemini 2.5 Flash
- **Speech Processing**: Web Speech API
- **Computer Vision**: TensorFlow.js + Face API
- **Real-time Analysis**: Custom emotion & focus detection

### **Deployment & Infrastructure**
- **Platform**: Vercel (Edge Functions)
- **Database**: Neon PostgreSQL
- **CDN**: Vercel Edge Network
- **Analytics**: Built-in performance tracking

---

## 🚀 Quick Start

### **Prerequisites**
```bash
Node.js 18+
npm or yarn
PostgreSQL database (Neon recommended)
```

### **1. Clone Repository**
```bash
git clone https://github.com/Raiyyanpatel/PrepVerse.git
cd PrepVerse
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.env.local` in the root directory:

```env
# Database (Neon PostgreSQL)
NEXT_PUBLIC_DRIZZLE_DB_URL=postgresql://user:password@host/database

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Services (Google Gemini)
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# Code Execution (Judge0 via RapidAPI)
RAPIDAPI_KEY_JUDGE0=your_rapidapi_key
JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

### **4. Database Setup**
```bash
# Run migrations
node migrate-judge0.cjs

# Seed initial questions
node scripts/create-questions.js

# Seed hidden test cases
node scripts/seed-hidden-tests.cjs 5
node scripts/seed-perfect-pairs.cjs 10
```

### **5. Start Development**
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
PrepVerse/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── api/                # API routes
│   │   ├── judge/          # Code execution endpoint
│   │   ├── run/            # Example test runner
│   │   ├── questions/      # Question management
│   │   └── tech-trends/    # News aggregation
│   ├── dashboard/          # Interview dashboard
│   ├── practice/dsa/       # DSA problem pages
│   └── [other features]/   # Interview prep, learning, etc.
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn/UI components
│   ├── CodeEditor.jsx      # Monaco editor wrapper
│   └── [other components]/ # Specialized components
├── utils/                  # Utility functions
│   ├── db.js              # Database connection
│   ├── schema.js          # Database schema
│   └── GeminiAIModel.js   # AI service
├── scripts/               # Database & utility scripts
│   ├── create-questions.js     # Question seeding
│   ├── seed-hidden-tests.cjs   # Test case generation
│   └── seed-perfect-pairs.cjs  # Perfect pairs seeding
└── [config files]         # Next.js, Tailwind, etc.
```

---

## 🎯 Key Features Explained

### **DSA Practice System**
- **Monaco Editor**: Full VS Code experience in browser
- **Judge0 Integration**: Real code execution with multiple languages
- **Verdict System**: Accepted, Wrong Answer, TLE, Compilation Error, Runtime Error, Memory Limit Exceeded
- **Hidden Tests**: Secure testing with multiple test cases per problem
- **Performance Metrics**: Time and memory usage tracking

### **AI Mock Interview**
- **Contextual Questions**: AI generates relevant questions based on role/experience
- **Multi-modal Analysis**: Voice, emotion, and behavior tracking
- **Real-time Feedback**: Instant suggestions during practice
- **Comprehensive Reports**: Detailed analysis with improvement areas

### **Tech News Integration**
- **Gemini-powered**: AI curates and summarizes latest tech developments
- **Manual Refresh**: User-controlled updates (no spam)
- **Multiple Sources**: Fallback to reliable sources if quota exceeded
- **Smart Caching**: Daily caching with localStorage persistence

---

## 🔧 Configuration & Deployment

### **Environment Variables**
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DRIZZLE_DB_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `RAPIDAPI_KEY_JUDGE0` | RapidAPI key for Judge0 | ✅ |
| `JUDGE0_HOST` | Judge0 service host | ✅ |

### **Deployment (Vercel)**
```bash
# Connect to Vercel
npx vercel

# Set environment variables in Vercel dashboard
# Deploy
npx vercel --prod
```

### **Database Migrations**
```bash
# Initial setup
node migrate-judge0.cjs

# Add new questions
node scripts/create-questions.js

# Generate test cases
node scripts/seed-hidden-tests.cjs [count]
node scripts/seed-perfect-pairs.cjs [count]
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Development Workflow**
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### **Contribution Areas**
- 🔧 **New DSA Problems**: Add more coding challenges
- 🎨 **UI/UX Improvements**: Enhance user experience
- 🤖 **AI Features**: Improve interview analysis
- 📚 **Documentation**: Help others understand the codebase
- 🐛 **Bug Fixes**: Report and fix issues

### **Code Standards**
- Use **TypeScript** for type safety
- Follow **ESLint** configuration
- Write **clean, documented code**
- Add **meaningful commit messages**

---

## 📊 Performance & Analytics

### **Built-in Metrics**
- ⚡ **Code Execution Time**: Real-time performance tracking
- 💾 **Memory Usage**: Memory consumption analysis
- 🎯 **Success Rates**: Problem-solving statistics
- 📈 **Learning Progress**: Skill development tracking

### **Monitoring**
- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Comprehensive error logging
- **User Feedback**: Integrated feedback collection

---

## 🔐 Security & Privacy

- 🔒 **Secure Authentication** via Clerk
- 🛡️ **Data Protection** with encrypted connections
- 🔍 **Code Isolation** in Judge0 containers
- 📊 **Privacy-first Analytics** with minimal data collection

---

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

---

## 🆘 Troubleshooting

### **Common Issues**

**Monaco Editor not loading?**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Database connection failed?**
```bash
# Check environment variables
echo $NEXT_PUBLIC_DRIZZLE_DB_URL
# Re-run migrations
node migrate-judge0.cjs
```

**Judge0 errors?**
```bash
# Verify RapidAPI subscription
# Check quota limits
# Validate environment variables
```

---

## 📧 Support & Community

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Raiyyanpatel/PrepVerse/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Raiyyanpatel/PrepVerse/discussions)
- 📧 **Email Support**: [raiyyanpatel@example.com](mailto:raiyyanpatel@example.com)
- 💬 **Community Chat**: [Discord Server](https://discord.gg/your-server)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🧠 **Google Gemini AI** for powerful language processing
- ⚖️ **Judge0** for reliable code execution
- 🎨 **Shadcn/UI** for beautiful components
- 🔐 **Clerk** for seamless authentication
- 🗄️ **Neon** for serverless PostgreSQL
- ⚡ **Vercel** for effortless deployment
- 🤝 **Open Source Community** for continuous inspiration

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Raiyyanpatel/PrepVerse&type=Date)](https://star-history.com/#Raiyyanpatel/PrepVerse&Date)

---

<div align="center">

**⭐ If this project helped you, please consider giving it a star!**

[🚀 Get Started](https://prepverse.vercel.app) • [📖 Documentation](https://github.com/Raiyyanpatel/PrepVerse/wiki) • [🐛 Report Bug](https://github.com/Raiyyanpatel/PrepVerse/issues) • [💡 Request Feature](https://github.com/Raiyyanpatel/PrepVerse/discussions)

---

**Made with ❤️ by [Raiyyan Patel](https://github.com/Raiyyanpatel)**

</div>
