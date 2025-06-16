"use client";

import { useEffect, useRef, useState } from 'react';

interface SpiralViewerProps {
  shaderName?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  speed?: number;
  intensity?: number;
}

export default function SpiralViewer({ 
  shaderName = 'pink_spiral',
  width = 800,
  height = 600,
  autoplay = true,
  speed = 1.0,
  intensity = 1.0
}: SpiralViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    let program: WebGLProgram | null = null;
    let timeUniform: WebGLUniformLocation | null;
    let resolutionUniform: WebGLUniformLocation | null;

    const initShader = async () => {
      try {
        // Load shader from public directory
        const response = await fetch(`/shaders/${shaderName}.frag`);
        const fragmentShaderSource = await response.text();

        const vertexShaderSource = `
          attribute vec2 a_position;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `;

        // Create shaders
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
          throw new Error('Failed to create shaders');
        }

        // Create program
        program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) {
          throw new Error('Failed to create shader program');
        }

        // Get uniform locations
        timeUniform = gl.getUniformLocation(program, 'iTime');
        resolutionUniform = gl.getUniformLocation(program, 'iResolution');

        // Set up geometry (full-screen quad)
        const positions = new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,
           1,  1,
        ]);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        // Start render loop
        render();

      } catch (error) {
        console.error('Error loading shader:', error);
        // Fallback to simple animated background
        renderFallback();
      }
    };

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }

      return program;
    };

    const render = () => {
      if (!gl || !program) return;

      // Set viewport
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Use shader program
      gl.useProgram(program);

      // Update uniforms
      if (timeUniform) {
        gl.uniform1f(timeUniform, currentTime * speed);
      }
      if (resolutionUniform) {
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      }

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Continue animation if playing
      if (isPlaying) {
        setCurrentTime(prev => prev + 0.016); // ~60fps
        animationRef.current = requestAnimationFrame(render);
      }
    };

    const renderFallback = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const animate = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple rotating spiral fallback
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = currentTime * speed;

        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < 360; i += 2) {
          const angle = (i + time * 50) * Math.PI / 180;
          const radius = i * 0.5;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        if (isPlaying) {
          setCurrentTime(prev => prev + 0.016);
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    };

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initialize
    initShader();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shaderName, width, height, speed, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setCurrentTime(0);
  };

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg"
        style={{ width, height }}
      />
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={togglePlayback}
          className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={resetAnimation}
          className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70"
        >
          Reset
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Time: {currentTime.toFixed(2)}s | Speed: {speed}x | Shader: {shaderName}
      </div>
    </div>
  );
}