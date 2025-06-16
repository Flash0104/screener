"use client";

import { motion } from 'framer-motion';
import { Camera, Download, Mic, Monitor, Play, Settings, Square, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface RecordingOptions {
  includeAudio: boolean;
  includeCamera: boolean;
  quality: 'high' | 'medium' | 'low';
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [options, setOptions] = useState<RecordingOptions>({
    includeAudio: true,
    includeCamera: false,
    quality: 'high'
  });

  // Check if we're on mobile and screen recording support
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasScreenShare = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
    
    // Set isMobile to true only if it's mobile AND doesn't support screen sharing
    setIsMobile(isMobileDevice && !hasScreenShare);
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = useCallback(async () => {
    try {
      let displayStream: MediaStream;

      if (isMobile) {
        // Mobile: Use camera instead of screen
        const cameraConstraints = {
          video: {
            width: options.quality === 'high' ? 1920 : options.quality === 'medium' ? 1280 : 854,
            height: options.quality === 'high' ? 1080 : options.quality === 'medium' ? 720 : 480,
            facingMode: options.includeCamera ? 'user' : 'environment' // front camera if includeCamera is true, back camera otherwise
          },
          audio: options.includeAudio
        };

        displayStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
        toast.success('📱 Camera recording started!');
      } else {
        // Desktop: Use screen recording
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          toast.error('Screen recording is not supported on this browser.');
          return;
        }

        const displayConstraints = {
          video: {
            width: options.quality === 'high' ? 1920 : options.quality === 'medium' ? 1280 : 854,
            height: options.quality === 'high' ? 1080 : options.quality === 'medium' ? 720 : 480
          },
          audio: options.includeAudio
        };

        displayStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);
      }
      
      const combinedStream = displayStream;
      let cameraStream = null;

      // 2. Add microphone if screen doesn't have audio (desktop only)
      if (!isMobile && options.includeAudio && displayStream.getAudioTracks().length === 0) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          const audioTrack = micStream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream.addTrack(audioTrack);
            toast.success('🎤 Microphone added');
          }
        } catch (err) {
          console.log('Microphone access failed:', err);
          toast.error('Microphone permission denied');
        }
      }

      // 3. Add camera if enabled (desktop only - mobile already has camera)
      if (!isMobile && options.includeCamera) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: 320, 
              height: 240,
              facingMode: 'user'
            },
            audio: false
          });
          
          // Create picture-in-picture using canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not supported');
          
          const screenVideo = document.createElement('video');
          const cameraVideo = document.createElement('video');
          
          // Set canvas size to screen recording size
          canvas.width = options.quality === 'high' ? 1920 : options.quality === 'medium' ? 1280 : 854;
          canvas.height = options.quality === 'high' ? 1080 : options.quality === 'medium' ? 720 : 480;
          
          screenVideo.srcObject = displayStream;
          cameraVideo.srcObject = cameraStream;
          
          await Promise.all([
            new Promise(resolve => { screenVideo.onloadedmetadata = resolve; }),
            new Promise(resolve => { cameraVideo.onloadedmetadata = resolve; })
          ]);
          
          screenVideo.play();
          cameraVideo.play();
          
          // Combine video streams on canvas
          const drawFrame = () => {
            if (screenVideo.readyState === 4 && cameraVideo.readyState === 4) {
              // Draw screen video
              ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
              
              // Draw camera in bottom-right corner
              const cameraWidth = 320;
              const cameraHeight = 240;
              const margin = 20;
              ctx.drawImage(
                cameraVideo, 
                canvas.width - cameraWidth - margin, 
                canvas.height - cameraHeight - margin, 
                cameraWidth, 
                cameraHeight
              );
            }
            requestAnimationFrame(drawFrame);
          };
          drawFrame();
          
          // Replace video track with canvas stream
          const canvasStream = canvas.captureStream(30);
          const videoTrack = canvasStream.getVideoTracks()[0];
          
          // Replace original video track
          const originalVideoTrack = combinedStream.getVideoTracks()[0];
          combinedStream.removeTrack(originalVideoTrack);
          combinedStream.addTrack(videoTrack);
          
          toast.success('📹 Camera added (PiP)');
        } catch (err) {
          console.log('Camera access failed:', err);
          toast.error('Camera permission denied');
        }
      }

      streamRef.current = combinedStream;
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Wait for the video element to be rendered
        setTimeout(() => {
          if (videoRef.current) {
            const videoUrl = URL.createObjectURL(blob);
            videoRef.current.src = videoUrl;
            videoRef.current.load(); // Force reload the video element
            
            // Try to play if audio is included
            if (options.includeAudio) {
              videoRef.current.play().catch(() => {
                // Autoplay failed, user needs to click play
                console.log('Autoplay prevented, user interaction required');
              });
            }
          }
        }, 100);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [options, isMobile]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsRecording(false);
      toast.success('Recording stopped!');
    }
  }, [isRecording]);

  const uploadVideo = async () => {
    if (!recordedBlob) return;

    // Check file size (40MB limit)
    const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB
    if (recordedBlob.size > MAX_FILE_SIZE) {
      toast.error(`File too large! Maximum size is 40MB. Your file is ${Math.round(recordedBlob.size / (1024 * 1024))}MB.`);
      return;
    }

    const title = prompt('Enter video title:');
    if (!title) return;

    const description = prompt('Enter video description (optional):') || '';

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, 'recording.webm');
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Video uploaded successfully!');
        setRecordedBlob(null);
        if (videoRef.current) {
          videoRef.current.src = '';
        }
      } else {
        throw new Error(data.details || data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadVideo = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener-recording-${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"
      >
        {/* Recording Controls */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isMobile ? 'Camera Recorder' : 'Screen Recorder'}
          </h2>
          
          {isMobile && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="text-blue-200 text-center">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Your device doesn&apos;t support screen recording</p>
                <p className="text-sm">Using camera recording instead</p>
              </div>
            </div>
          )}
          
                    {isRecording && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-xl">{formatTime(recordingTime)}</span>
            </div>
          )}

          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                <Play className="w-6 h-6" />
                <span className="font-semibold">Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full flex items-center space-x-2 transition-all duration-200"
              >
                <Square className="w-6 h-6" />
                <span className="font-semibold">Stop Recording</span>
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-200"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-black/20 rounded-xl p-6 mb-8"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Recording Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={options.includeAudio}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                  className="rounded"
                />
                <Mic className="w-4 h-4" />
                <span>Include Audio</span>
              </label>

              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={options.includeCamera}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeCamera: e.target.checked }))}
                  className="rounded"
                />
                <Camera className="w-4 h-4" />
                <span>{isMobile ? 'Front Camera' : 'Include Camera'}</span>
              </label>

              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-white" />
                <select
                  value={options.quality}
                  onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="bg-white/20 text-white rounded px-2 py-1 border border-white/30"
                >
                  <option value="high">High Quality</option>
                  <option value="medium">Medium Quality</option>
                  <option value="low">Low Quality</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Video Preview */}
        {recordedBlob && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-white font-semibold mb-4">Recording Preview</h3>
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: '400px' }}
            >
              <source type="video/webm" />
              <source type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button
                onClick={uploadVideo}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
              </button>

              <button
                onClick={downloadVideo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="text-center text-gray-300">
          {isMobile ? (
            <>
              <p className="mb-2">Click &quot;Start Recording&quot; to record with your camera</p>
              <p className="text-sm">Your browser will ask for permission to access your camera and microphone</p>
            </>
          ) : (
            <>
              <p className="mb-2">Click &quot;Start Recording&quot; to capture your screen</p>
              <p className="text-sm">Your browser will ask for permission to access your screen</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
} 