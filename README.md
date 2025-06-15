# Screener 🎬 - Complete Live Streaming & Recording Platform

> **The Ultimate Zoom-like Web Application** - Professional screen recording, live streaming, and video management platform built with cutting-edge web technologies.

🚀 **Live Demo**: [screener-i7so5kadl-flash0104s-projects.vercel.app](https://screener-i7so5kadl-flash0104s-projects.vercel.app)

## 🌟 What Makes Screener Special

Screener is not just another screen recorder - it's a **complete video collaboration platform** that rivals professional tools like Zoom, Loom, and OBS Studio, all running directly in your browser with **zero downloads required**.

### 🎯 Core Capabilities

- **🔴 Live Streaming** - Real-time peer-to-peer video calls with WebRTC
- **📹 Professional Recording** - High-quality screen + camera recording
- **☁️ Cloud Management** - Automatic video processing and storage
- **🎮 Interactive Gallery** - Browse, preview, and manage all recordings

## 🧩 Advanced Tech Stack

### Frontend Excellence
- **Next.js 15.3.3** - Latest App Router with Turbopack for lightning-fast development
- **TypeScript** - Full type safety across the entire application
- **Tailwind CSS 4** - Modern utility-first styling with custom gradients
- **Framer Motion** - Buttery smooth animations and page transitions
- **WebRTC** - Peer-to-peer real-time communication
- **MediaRecorder API** - Native browser recording capabilities
- **Socket.io Client** - Real-time bidirectional communication

### Backend & Infrastructure
- **Next.js API Routes** - Serverless backend with edge functions
- **Prisma ORM 6.9.0** - Type-safe database operations with auto-generation
- **Supabase PostgreSQL** - Scalable database with connection pooling
- **Socket.io Server** - Real-time signaling for WebRTC connections
- **Cloudinary** - Professional video hosting, CDN, and optimization
- **Zod** - Runtime type validation and API security

### Production Ready
- **Vercel Deployment** - Edge-optimized hosting with automatic scaling
- **Environment Management** - Secure configuration across all environments
- **Build Optimization** - Prisma client generation and Next.js optimization
- **Error Handling** - Comprehensive error boundaries and logging

## ✨ Incredible Features

### 🎥 Live Streaming Tab
- **WebRTC Peer-to-Peer** - Direct browser-to-browser video calls
- **Room-based System** - Join rooms with simple room codes
- **Real-time Participants** - See who's connected in real-time
- **Media Controls** - Toggle camera, microphone, and screen sharing
- **Professional UI** - Clean interface with participant management

### 📹 Record Tab
- **Screen Recording** - Capture entire screen, specific windows, or browser tabs
- **Camera Picture-in-Picture** - Draggable camera overlay with custom positioning
- **Audio Capture** - System audio + microphone with perfect synchronization
- **Real-time Preview** - See exactly what you're recording before you start
- **Quality Settings** - Customizable resolution and bitrate options

### 🗂️ Gallery Tab
- **Video Management** - Upload, view, download, and delete recordings
- **Smart Thumbnails** - Auto-generated video thumbnails with Cloudinary
- **Modal Playback** - Full-screen video player with controls
- **Metadata Display** - Title, description, duration, and upload date
- **Cloud Integration** - Seamless Cloudinary storage and CDN delivery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (PostgreSQL)
- Cloudinary account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Flash0104/screener.git
cd screener
npm install
```

2. **Environment Setup:**
Create `.env.local` with:
```bash
# Database (Supabase with Connection Pooling)
DATABASE_URL="postgresql://postgres.your-ref:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Configuration
SUPABASE_URL="https://your-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary Video Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3. **Database Setup:**
```bash
npx prisma generate
npx prisma db push
```

4. **Development Server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start creating!

## 🎮 How to Use

### Live Streaming
1. Navigate to **Live Stream** tab
2. Enter a room code or create a new room
3. Allow camera/microphone permissions
4. Share your room code with others
5. Enjoy real-time video collaboration!

### Screen Recording
1. Go to **Record** tab
2. Click "Start Recording" and select your screen
3. Position the draggable camera overlay
4. Record your content with professional quality
5. Stop recording and preview your video

### Video Management
1. Visit **Gallery** tab to see all recordings
2. Click any video to play in full-screen modal
3. Download videos or copy shareable links
4. Delete recordings you no longer need

## 🌐 Production Deployment

Screener is production-ready and deployed on Vercel:

```bash
# Deploy to production
vercel --prod

# Environment variables are automatically configured
# Database uses connection pooling for optimal performance
# Cloudinary handles video CDN and optimization
```

**Live Production URL**: https://screener-i7so5kadl-flash0104s-projects.vercel.app

## 🛠️ Development Commands

```bash
npm run dev          # Start development with Turbopack
npm run build        # Production build with Prisma generation
npm run start        # Start production server
npm run lint         # ESLint code quality checks
npx prisma studio    # Visual database management
npx prisma generate  # Regenerate Prisma client
```

## 📁 Project Architecture

```
screener/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── upload/        # Video upload endpoint
│   │   │   ├── videos/        # Video CRUD operations
│   │   │   └── socket/        # WebRTC signaling server
│   │   ├── globals.css        # Global styles and animations
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── LiveStreamer.tsx   # WebRTC live streaming
│   │   ├── ScreenRecorder.tsx # Screen recording functionality
│   │   ├── VideoGallery.tsx   # Video management interface
│   │   └── ui/               # Reusable UI components
│   └── lib/                  # Utility libraries
│       ├── prisma.ts         # Database client configuration
│       ├── cloudinary.ts     # Video storage client
│       └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma         # Database schema definition
├── public/                   # Static assets
├── next.config.js           # Next.js configuration
├── vercel.json             # Deployment configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Design Excellence

### Visual Features
- **Purple Gradient Theme** - Professional and modern color scheme
- **Glass Morphism Effects** - Frosted glass UI elements
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Loading States** - Skeleton loading and progress indicators

### User Experience
- **Intuitive Navigation** - Three-tab interface with color coding
- **Real-time Feedback** - Toast notifications for all actions
- **Drag & Drop** - Interactive camera positioning
- **Modal Interfaces** - Clean video playback and settings
- **Error Handling** - Graceful error states and recovery

## 🔒 Security & Performance

### Security Features
- **Input Validation** - Zod schema validation on all endpoints
- **Secure File Uploads** - Cloudinary signed uploads
- **Environment Protection** - Secure credential management
- **CORS Configuration** - Proper cross-origin resource sharing

### Performance Optimizations
- **Connection Pooling** - Supabase PostgreSQL optimization
- **CDN Delivery** - Cloudinary global video distribution
- **Edge Functions** - Vercel edge-optimized API routes
- **Build Optimization** - Next.js production optimizations

## 🏆 Technical Achievements

### What We Built
- ✅ **Complete WebRTC Implementation** - Peer-to-peer video calls
- ✅ **Professional Screen Recording** - MediaRecorder API mastery
- ✅ **Real-time Signaling Server** - Socket.io WebRTC coordination
- ✅ **Cloud Video Pipeline** - Cloudinary integration with thumbnails
- ✅ **Production Database** - Prisma + Supabase with pooling
- ✅ **Responsive UI/UX** - Modern design with animations
- ✅ **Full-stack TypeScript** - End-to-end type safety

### Technical Challenges Solved
- 🔧 **WebRTC Signaling** - Complex peer connection management
- 🔧 **MediaRecorder Constraints** - Browser compatibility and permissions
- 🔧 **Video Processing** - Cloudinary upload and thumbnail generation
- 🔧 **Database Optimization** - Connection pooling for production
- 🔧 **Real-time Communication** - Socket.io server implementation
- 🔧 **Production Deployment** - Vercel environment configuration

## 🌟 Why Screener is Amazing

1. **Zero Installation** - Runs entirely in the browser
2. **Professional Quality** - Rivals desktop applications
3. **Real-time Collaboration** - WebRTC peer-to-peer technology
4. **Cloud-first Architecture** - Scalable and reliable
5. **Modern Tech Stack** - Built with the latest technologies
6. **Production Ready** - Deployed and accessible worldwide

---

**Built with ❤️ by developers who believe in the power of modern web technologies.**

*Screener proves that web applications can be just as powerful as native desktop software, delivering professional-grade video recording and streaming capabilities directly in your browser.*
