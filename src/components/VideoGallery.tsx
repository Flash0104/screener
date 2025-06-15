"use client";

import { motion } from 'framer-motion';
import { Calendar, Clock, Download, Eye, Play, Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Video {
  id: string;
  title: string;
  description?: string;
  cloudinaryUrl: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
      } else {
        toast.error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Fetch videos error:', error);
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setIsDeleting(videoId);
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        toast.success('Video deleted successfully');
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(null);
        }
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeleting(null);
    }
  };

  const shareVideo = async (video: Video) => {
    try {
      await navigator.clipboard.writeText(video.cloudinaryUrl);
      toast.success('Video link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const downloadVideo = (video: Video) => {
    const a = document.createElement('a');
    a.href = video.cloudinaryUrl;
    a.download = `${video.title}.mp4`;
    a.target = '_blank';
    a.click();
    toast.success('Download started!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/20 rounded w-48 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 space-y-3">
                  <div className="h-40 bg-white/20 rounded-lg" />
                  <div className="h-4 bg-white/20 rounded w-3/4" />
                  <div className="h-3 bg-white/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Video Gallery</h2>
          <p className="text-gray-300">Your recorded videos ({videos.length})</p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
            <p className="text-gray-300">Start recording to see your videos here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-200 group"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-black">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 transform hover:scale-110"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 truncate" title={video.title}>
                    {video.title}
                  </h3>
                  
                  {video.description && (
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2" title={video.description}>
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => shareVideo(video)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => downloadVideo(video)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all duration-200"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteVideo(video.id)}
                      disabled={isDeleting === video.id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white p-2 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <video
              controls
              autoPlay
              className="w-full rounded-lg bg-black mb-4"
              style={{ maxHeight: '60vh' }}
            >
              <source src={selectedVideo.cloudinaryUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {selectedVideo.description && (
              <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
            )}

            <div className="flex items-center justify-between text-gray-400 text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedVideo.createdAt)}</span>
                </div>
                {selectedVideo.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(selectedVideo.duration)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => shareVideo(selectedVideo)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => downloadVideo(selectedVideo)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 