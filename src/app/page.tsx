"use client";

import LiveStreamer from '@/components/LiveStreamer';
import ScreenRecorder from '@/components/ScreenRecorder';
import VideoGallery from '@/components/VideoGallery';
import { Monitor, Radio, Upload, Video } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'stream' | 'record' | 'gallery'>('stream');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Screener</h1>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'stream'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Live Stream</span>
              </button>
              
              <button
                onClick={() => setActiveTab('record')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'record'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Record</span>
              </button>
              
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'gallery'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Gallery</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stream' && <LiveStreamer />}
        {activeTab === 'record' && <ScreenRecorder />}
        {activeTab === 'gallery' && <VideoGallery />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-400">
        <p>© 2024 Screener - Record, Share, Collaborate</p>
      </footer>
    </div>
  );
}
