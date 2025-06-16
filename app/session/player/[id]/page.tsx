"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, SkipForward, Volume2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import SpiralViewer from '@/components/ui/spiral-viewer';

export default function SessionPlayer() {
  const params = useParams();
  const sessionId = params.id as string;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showVisuals, setShowVisuals] = useState(true);
  const [volume, setVolume] = useState(70);
  const [currentMantra, setCurrentMantra] = useState("You are becoming more relaxed and focused with each breath...");

  const mantras = [
    "You are becoming more relaxed and focused with each breath...",
    "Your mind is opening to new possibilities and deeper states...",
    "You feel completely safe and comfortable as you listen...",
    "Each word draws you deeper into this peaceful state...",
    "You are exactly where you need to be in this moment..."
  ];

  useEffect(() => {
    // Simulate progress and changing mantras
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = (prev + 1) % 100;
          
          // Change mantra every 20% progress
          if (newProgress % 20 === 0) {
            const mantraIndex = Math.floor(newProgress / 20) % mantras.length;
            setCurrentMantra(mantras[mantraIndex]);
          }
          
          return newProgress;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, mantras]);

  const phaseInfo = [
    { name: "Induction", player: "Direct", cycler: "Chain", duration: "5 min" },
    { name: "Deepening", player: "Tri-Chamber", cycler: "Adaptive", duration: "7 min" },
    { name: "Suggestions", player: "Rotational", cycler: "Weave", duration: "3 min" }
  ];

  const currentPhaseInfo = phaseInfo[currentPhase - 1];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Session Player</h1>
                <p className="text-gray-400">Immersive Hypnosis Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVisuals(!showVisuals)}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                title={showVisuals ? "Hide visuals" : "Show visuals"}
              >
                {showVisuals ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Visual Panel */}
          <div className="flex justify-center items-center">
            {showVisuals ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-white mb-2">Visual Focus</h3>
                  <p className="text-sm text-gray-400">Let your eyes follow the patterns...</p>
                </div>
                <SpiralViewer 
                  shaderName="pink_spiral"
                  width={500}
                  height={400}
                  autoplay={isPlaying}
                  speed={isPlaying ? 0.7 : 0}
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🌸</div>
                <h3 className="text-xl font-medium text-white mb-2">Audio Focus Mode</h3>
                <p className="text-gray-400">Close your eyes and listen deeply</p>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            
            {/* Current Phase Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Phase {currentPhase}: {currentPhaseInfo.name}</h3>
                <span className="text-sm text-gray-400">{currentPhaseInfo.duration}</span>
              </div>
              <div className="text-sm text-gray-400 mb-4">
                Player: {currentPhaseInfo.player} • Cycler: {currentPhaseInfo.cycler}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-400">{progress}% Complete</div>
            </div>

            {/* Current Mantra */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Current Mantra</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-200 italic text-center leading-relaxed">
                  &ldquo;{currentMantra}&rdquo;
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Controls</h3>
              
              <div className="flex justify-center items-center gap-6 mb-6">
                <button 
                  onClick={() => setCurrentPhase(Math.max(1, currentPhase - 1))}
                  className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                  disabled={currentPhase === 1}
                >
                  <SkipForward className="w-6 h-6 rotate-180" />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
                
                <button 
                  onClick={() => setCurrentPhase(Math.min(3, currentPhase + 1))}
                  className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                  disabled={currentPhase === 3}
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 accent-pink-600"
                />
                <span className="text-sm text-gray-400 w-12">{volume}%</span>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Session Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Duration:</span>
                  <span className="text-white">15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Themes:</span>
                  <span className="text-white">Relaxation, Focus, Acceptance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-white">Light</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Session ID:</span>
                  <span className="text-white font-mono text-xs">{sessionId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-800 rounded-full px-6 py-3">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isPlaying ? 'Session Active' : 'Session Paused'} • Enhanced with visuals and spatial audio
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}