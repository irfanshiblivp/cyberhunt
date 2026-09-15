import React, { useRef, useEffect, useState } from 'react';
import { StarfieldCanvas } from './StarfieldCanvas';

export const BackgroundVideo: React.FC = () => {
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted or video file missing, fallback to canvas
        console.log('Video background autoplay fallback enabled');
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-space-900">
      {!hasVideoError ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setHasVideoError(true)}
          className="w-full h-full object-cover opacity-65"
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
      ) : (
        <StarfieldCanvas />
      )}
      {/* Dark vignette gradient overlay for high contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/60 to-space-900/80 pointer-events-none" />
    </div>
  );
};
