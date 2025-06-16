"use client";

import {
    Camera,
    Copy,
    Mic,
    MicOff,
    Monitor,
    MonitorOff,
    Phone,
    PhoneOff,
    Share2,
    Users,
    Video,
    VideoOff
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

// Interface for future P2P connections
// interface PeerConnection {
//   id: string;
//   connection: RTCPeerConnection;
//   stream?: MediaStream;
// }

export default function LiveStreamer() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState({
    video: true,
    audio: true,
    screen: false
  });
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Check if we're on mobile (for UI adjustments only)
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<{
    emit: (event: string, data: unknown) => void;
    disconnect: () => void;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
  } | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  
  // Draggable camera handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPipPosition({
      x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - 160)),
      y: Math.max(0, Math.min(window.innerHeight - 240, e.clientY - 120))
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Camera stream connection
  useEffect(() => {
    if (cameraStream && cameraVideoRef.current) {
      console.log('🔗 Connecting camera stream to PiP card');
      cameraVideoRef.current.srcObject = cameraStream;
      
      cameraVideoRef.current.play()
        .then(() => console.log('✅ PiP camera playing'))
        .catch(err => console.error('❌ PiP camera play failed:', err));
    }
  }, [cameraStream]);

  // Simple test function
  const testCamera = async () => {
    console.log('🧪 Testing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      
      console.log('✅ Stream created:', stream);
      console.log('📐 Video tracks:', stream.getVideoTracks());
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Direct assignment
      if (localVideoRef.current) {
        console.log('📺 Assigning to video element...');
        localVideoRef.current.srcObject = stream;
        
        // Force play
        setTimeout(() => {
          if (localVideoRef.current) {
            localVideoRef.current.play()
              .then(() => console.log('▶️ Video playing'))
              .catch(err => console.error('❌ Play failed:', err));
          }
        }, 100);
      }
      
      toast.success('🎥 Camera test successful!');
    } catch (error) {
      console.error('❌ Camera test failed:', error);
      toast.error('Camera failed: ' + (error as Error).message);
    }
  };

  // Generate room ID
  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
    return id;
  };

  // Initialize Socket.io connection
  const initializeSocket = useCallback(async () => {
    try {
      // Initialize socket connection to our API
      await fetch('/api/socket');
      
      const socket = io({
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Connected to signaling server');
        socketRef.current = socket;
      });

      socket.on('user-joined', (data: { userId: string }) => {
        createPeerConnection(data.userId, false);
        setParticipantCount(prev => prev + 1);
        toast.success(`User ${data.userId.slice(0, 6)} joined`);
      });

      socket.on('user-left', (data: { userId: string }) => {
        if (peersRef.current[data.userId]) {
          peersRef.current[data.userId].close();
          delete peersRef.current[data.userId];
        }
        setParticipantCount(prev => Math.max(0, prev - 1));
        toast.error(`User ${data.userId.slice(0, 6)} left`);
      });

      socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; fromId: string }) => {
        await handleOffer(data.offer, data.fromId);
      });

      socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; fromId: string }) => {
        await handleAnswer(data.answer, data.fromId);
      });

      socket.on('ice-candidate', async (data: { candidate: RTCIceCandidate; fromId: string }) => {
        await handleIceCandidate(data.candidate, data.fromId);
      });

      socket.on('room-participants', (data: { participants: string[] }) => {
        setParticipantCount(data.participants.length);
        // Create peer connections for existing participants
        data.participants.forEach(participantId => {
          createPeerConnection(participantId, true);
        });
      });

      return socket;
    } catch (error) {
      console.error('Socket connection failed:', error);
      toast.error('Connection failed - using local mode');
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string, shouldCreateOffer: boolean) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => [...prev.filter(s => s.id !== remoteStream.id), remoteStream]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          targetId: peerId,
          roomId: roomId
        });
      }
    };

    peersRef.current[peerId] = peerConnection;

    // Create offer if needed
    if (shouldCreateOffer) {
      createOffer(peerId);
    }
  }, [roomId]);

  // Create offer
  const createOffer = async (peerId: string) => {
    const peerConnection = peersRef.current[peerId];
    if (!peerConnection) return;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (socketRef.current) {
      socketRef.current.emit('offer', {
        offer,
        targetId: peerId,
        roomId: roomId
      });
    }
  };

  // Handle offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, fromId: string) => {
    const peerConnection = peersRef.current[fromId];
    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (socketRef.current) {
      socketRef.current.emit('answer', {
        answer,
        targetId: fromId,
        roomId: roomId
      });
    }
  }, [roomId]);

  // Handle answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromId: string) => {
    const peerConnection = peersRef.current[fromId];
    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(answer);
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidate, fromId: string) => {
    const peerConnection = peersRef.current[fromId];
    if (!peerConnection) return;

    await peerConnection.addIceCandidate(candidate);
  };

  // Start streaming
  const startStream = async () => {
    try {
      let stream: MediaStream;

      if (settings.screen) {
        // Screen share mode
        console.log('🖥️ Starting screen share...');
        toast.loading('Requesting screen share permission...');
        
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: settings.audio
        });
        toast.dismiss();
        console.log('✅ Screen share granted');

        // Add microphone if screen audio is not available
        if (settings.audio && stream.getAudioTracks().length === 0) {
          try {
            console.log('🎤 Adding microphone for screen share...');
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false
            });
            
            micStream.getAudioTracks().forEach(track => {
              stream.addTrack(track);
            });
            console.log('✅ Microphone added to screen share');
          } catch {
            console.log('❌ Microphone denied');
          }
        }

        // Add camera overlay if enabled
        if (settings.video) {
          try {
            toast.loading('Adding camera overlay...');
            const camStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
            toast.dismiss();
            
            setCameraStream(camStream);
            console.log('📹 Camera overlay ready');
            toast.success('🖥️📹 Screen + Camera overlay active!');
          } catch {
            toast.dismiss();
            console.log('Camera denied for screen share');
            toast.success('🖥️ Screen sharing active (camera denied)');
          }
        } else {
          toast.success('🖥️ Screen sharing active!');
        }
      } else {
        // Camera + microphone mode
        console.log('📹 Starting camera/mic...');
        toast.loading('Requesting camera/microphone permission...');
        
        stream = await navigator.mediaDevices.getUserMedia({
          video: settings.video,
          audio: settings.audio
        });
        toast.dismiss();
        
        const videoTracks = stream.getVideoTracks().length;
        const audioTracks = stream.getAudioTracks().length;
        console.log(`✅ Stream: ${videoTracks} video, ${audioTracks} audio tracks`);
        
        if (audioTracks > 0) {
          toast.success('📹🎤 Camera + Microphone active!');
        } else {
          toast.success('📹 Camera active (microphone denied)!');
        }
      }

      setLocalStream(stream);
      localStreamRef.current = stream;

      // Set video source
      if (localVideoRef.current) {
        console.log('📺 Setting video source...');
        localVideoRef.current.srcObject = stream;
        
        setTimeout(() => {
          if (localVideoRef.current) {
            localVideoRef.current.play()
              .then(() => console.log('▶️ Video playing'))
              .catch(err => console.log('Play failed:', err));
          }
        }, 100);
      }

      setIsStreaming(true);
      setParticipantCount(1);

      // Initialize WebRTC connection
      try {
        const socket = await initializeSocket();
        if (socket && roomId) {
          console.log('🔗 Joining room:', roomId);
          socket.emit('join-room', {
            roomId: roomId,
            isHost: true
          });
          toast.success('🔴 Live streaming! Others can join with Room ID');
        }
      } catch {
        console.log('WebRTC unavailable, local preview only');
        toast.success('🔴 Local preview active (WebRTC unavailable)');
      }

    } catch (error) {
      toast.dismiss();
      console.error('❌ Stream failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Permission denied! Check Chrome settings');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera/microphone found!');
        } else {
          toast.error('Stream failed: ' + error.message);
        }
      } else {
        toast.error('Stream failed - unknown error');
      }
    }
  };

  // Stop streaming
  const stopStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsStreaming(false);
    setRemoteStreams([]);
    setParticipantCount(0);
    toast.success('Stream stopped');
  };

  // Toggle settings
  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Copy room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied!');
  };

  // Share room
  const shareRoom = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied!');
  };

  // Join room from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Mobile Info */}
      {isMobile && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="text-blue-200 text-center">
            <div className="flex justify-center space-x-2 mb-3">
              <Monitor className="w-8 h-8" />
              <span className="text-lg">+</span>
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Recording Mode</h3>
            <p className="text-sm mb-2">Will try screen sharing first, fallback to camera if needed.</p>
            <p className="text-sm">Choose your preferred mode with the buttons below.</p>
          </div>
        </div>
      )}

      {/* Room Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              {isStreaming ? '🔴 Live Stream Active' : '📺 Start Live Stream'}
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
                className="px-3 py-2 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 text-sm flex-1 max-w-xs"
                maxLength={6}
              />
              <button
                onClick={generateRoomId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Generate
              </button>
              {roomId && (
                <>
                  <button
                    onClick={copyRoomId}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareRoom}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isStreaming ? (
              <>
                <button
                  onClick={startStream}
                  disabled={!roomId}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Go Live
                </button>
                <button
                  onClick={testCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🧪 Test Camera
                </button>
                <button
                  onClick={() => {
                    if (localStream) {
                      localStream.getTracks().forEach(track => track.stop());
                    }
                    if (localVideoRef.current) {
                      localVideoRef.current.srcObject = null;
                    }
                    setLocalStream(null);
                    localStreamRef.current = null;
                    console.log('🧹 Stream cleared');
                    toast.success('Stream cleared');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  🧹 Clear
                </button>
              </>
            ) : (
              <button
                onClick={stopStream}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Stream
              </button>
            )}
          </div>
        </div>

        {/* Stream Settings */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => toggleSetting('video')}
            className={`p-2 rounded-lg transition-colors ${
              settings.video 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
            title={settings.video ? 'Camera On' : 'Camera Off'}
          >
            {settings.video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => toggleSetting('audio')}
            className={`p-2 rounded-lg transition-colors ${
              settings.audio 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
            title={settings.audio ? 'Microphone On' : 'Microphone Off'}
          >
            {settings.audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => toggleSetting('screen')}
            className={`p-2 rounded-lg transition-colors ${
              settings.screen 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-white'
            }`}
            title={settings.screen ? 'Screen Share On' : 'Screen Share Off'}
          >
            {settings.screen ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local Video - Always show for testing */}
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            controls
            className="w-full h-64 bg-black rounded-lg object-cover"
            onLoadedMetadata={() => {
              console.log('📽️ Video metadata loaded');
            }}
            onCanPlay={() => {
              console.log('✅ Video can play');
            }}
            onPlay={() => {
              console.log('▶️ Video started playing');
            }}
            onError={(e) => {
              console.error('❌ Video error:', e);
            }}
          />
          <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
            {isStreaming ? '🔴 You (Live)' : '📹 Camera Preview'}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {localStream ? `${localStream.getVideoTracks().length} video, ${localStream.getAudioTracks().length} audio` : 'No stream'}
          </div>
        </div>

        {/* Remote Videos */}
        {remoteStreams.map((stream, index) => (
          <div key={stream.id} className="relative">
            <video
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded-lg object-cover"
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Participant {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Draggable Camera Overlay */}
      {cameraStream && isStreaming && settings.screen && (
        <div
          className={`fixed z-50 bg-transparent rounded-lg shadow-xl border-2 border-purple-500 overflow-hidden ${
            isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
          }`}
          style={{
            left: pipPosition.x,
            top: pipPosition.y,
            width: '320px',
            height: '240px'
          }}
          onMouseDown={handleMouseDown}
        >
          <video
            ref={cameraVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              console.log('📽️ PiP camera metadata loaded');
            }}
            onCanPlay={() => {
              console.log('✅ PiP camera can play');
            }}
            onPlay={() => {
              console.log('▶️ PiP camera playing');
            }}
            onError={(e) => {
              console.error('❌ PiP camera error:', e);
            }}
          />
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
            📹 You
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white px-1 py-1 rounded text-xs">
            🔀
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-8 flex items-end justify-between px-2 pb-1">
            <span className="text-white text-xs">Drag to move</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isStreaming && (
        <div className="bg-black/20 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">🎬 How to Live Stream:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="mb-2"><strong>1. Create or Join Room:</strong></p>
              <p className="text-sm">• Generate a Room ID or enter existing one</p>
              <p className="text-sm">• Share Room ID with others to join</p>
            </div>
            <div>
              <p className="mb-2"><strong>2. Configure Settings:</strong></p>
              <p className="text-sm">• Toggle camera, microphone, screen share</p>
              <p className="text-sm">• Screen share captures your entire screen</p>
            </div>
            <div>
              <p className="mb-2"><strong>3. Go Live:</strong></p>
              <p className="text-sm">• Click &quot;Go Live&quot; to start streaming</p>
              <p className="text-sm">• Others can join with the same Room ID</p>
            </div>
            <div>
              <p className="mb-2"><strong>4. Collaborate:</strong></p>
              <p className="text-sm">• Real-time video calls</p>
              <p className="text-sm">• Perfect for presentations & meetings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 