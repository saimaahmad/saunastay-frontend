import React, { useEffect, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.15; // Set a gentle volume
      audio.play().catch((e) => {
        console.error('Autoplay was blocked:', e);
      });
    }
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/music/relaxing-music-1.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Mute/Unmute Button */}
      <div
        className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-md cursor-pointer hover:shadow-lg transition"
        onClick={toggleMute}
      >
        {isMuted ? (
          <FiVolumeX className="text-2xl text-[#4d603e]" />
        ) : (
          <FiVolume2 className="text-2xl text-[#4d603e]" />
        )}
      </div>
    </>
  );
};

export default MusicPlayer;
