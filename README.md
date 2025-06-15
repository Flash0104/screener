# Screener 🚀

Modern screen recording and video sharing platform built with Next.js 14+ and cutting-edge web technologies.

## 🧩 Tech Stack

### Frontend
- **Next.js 14+** - App Router & API Routes
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Fast, responsive, mobile-first UI
- **MediaRecorder API** - Native browser screen recording
- **Framer Motion** - Smooth animations and page transitions
- **Lucide Icons** - Beautiful and consistent icons
- **React Hot Toast** - Toast notifications for user feedback

### Backend & Storage
- **Next.js API Routes** - Backend endpoints for upload and data processing
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **Cloudinary** - Video hosting, CDN, and optimization
- **Zod** - API request validation

## ✨ Features

- 🎥 **Screen Recording** - Record your screen with audio and camera options
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ☁️ **Cloud Storage** - Videos automatically uploaded to Cloudinary
- 🎯 **Video Gallery** - Browse, preview, and manage your recordings
- ⚙️ **Recording Settings** - Customize quality, audio, and camera options
- 📤 **Easy Sharing** - Copy video links or download recordings
- 🗑️ **Video Management** - Delete unwanted recordings
- ⚡ **Real-time Preview** - See your recording before uploading

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd screener
npm install
```

2. **Setup environment variables:**
Create a `.env.local` file with:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/screener_db"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

3. **Setup database:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Start development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app in action!

## 📖 Usage

1. **Record Screen:** Click "Start Recording" and select your screen
2. **Configure Settings:** Choose audio, camera, and quality options
3. **Stop & Preview:** Stop recording and preview your video
4. **Upload:** Add title/description and upload to cloud storage
5. **Share:** View in gallery, copy links, or download files

## 🌐 Deployment

Ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

Your app will be available at `screener.vercel.app`

## 🛠️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database GUI

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ScreenRecorder.tsx
│   └── VideoGallery.tsx
└── lib/               # Utility libraries
    ├── prisma.ts      # Database client
    ├── cloudinary.ts  # Cloud storage
    └── utils.ts       # Helper functions
```

## 🎨 UI Features

- **Dark Theme** - Beautiful gradient backgrounds
- **Glass Morphism** - Modern frosted glass effects
- **Animations** - Smooth transitions with Framer Motion
- **Loading States** - Skeleton loading and progress indicators
- **Toast Notifications** - Real-time user feedback

## 🔒 Security

- Input validation with Zod
- Secure file uploads
- Environment variable protection
- CORS and CSP headers

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
