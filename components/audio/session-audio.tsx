"use client";

import { useEffect, useRef } from "react";

export interface ArrangedSegment {
  durationSec: number;
  pan?: number; // -1..1
  gain?: number; // 0..1
}

interface SessionAudioProps {
  isPlaying: boolean;
  volume: number; // 0..100
  segments: ArrangedSegment[];
  loop?: boolean;
  onSegment?: (index: number) => void;
}

// Minimal WebAudio player that synthesizes tones with pan to demonstrate spatialization intent
export default function SessionAudio({ isPlaying, volume, segments, loop = true, onSegment }: SessionAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const playingRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const panRef = useRef<StereoPannerNode | null>(null);

  // Initialize context
  useEffect(() => {
    if (!ctxRef.current && typeof window !== 'undefined') {
      type ExtendedWindow = Window & { webkitAudioContext?: typeof AudioContext; AudioContext?: typeof AudioContext };
      const browserWindow = window as ExtendedWindow;
      const AudioContextCtor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
      if (!AudioContextCtor) return;

      const ctx = new AudioContextCtor();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) {
        pan.connect(gain);
      }
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
      panRef.current = pan;
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, []);

  // Volume mapping
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  // Playback control
  useEffect(() => {
    if (!ctxRef.current || !gainRef.current) return;

    if (isPlaying && !playingRef.current) {
      playingRef.current = true;
      playSequence();
    } else if (!isPlaying && playingRef.current) {
      // stop
      playingRef.current = false;
    }

    function playSequence() {
      if (!ctxRef.current || !playingRef.current) return;

      let index = 0;
      const ctx = ctxRef.current;

      const scheduleNext = () => {
        if (!playingRef.current) return;
        if (index >= segments.length) {
          if (loop) {
            index = 0;
          } else {
            playingRef.current = false;
            return;
          }
        }

        const seg = segments[index];
        if (onSegment) onSegment(index);

        // Basic oscillator per segment (placeholder for real audio)
        const osc = ctx.createOscillator();
        const segGain = ctx.createGain();
        segGain.gain.value = seg.gain ?? 0.4;
        // map player pan intent
        if (panRef.current) {
          panRef.current.pan.value = seg.pan ?? 0;
          osc.connect(panRef.current);
        } else {
          osc.connect(segGain);
        }
        if (panRef.current) panRef.current.connect(segGain);
        segGain.connect(gainRef.current!);

        // change tone slightly per segment
        osc.type = 'sine';
        osc.frequency.value = 220 + (index % 5) * 55;
        osc.start();

        const dur = Math.max(0.5, seg.durationSec);
        const now = ctx.currentTime;
        segGain.gain.setValueAtTime(segGain.gain.value, now);
        segGain.gain.linearRampToValueAtTime(0.0001, now + dur);
        osc.stop(now + dur);

        timerRef.current = window.setTimeout(() => {
          index += 1;
          scheduleNext();
        }, dur * 1000);
      };

      scheduleNext();
    }
  }, [isPlaying, segments, loop, onSegment]);

  return null;
}
