import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize, PictureInPicture, Pause, Play, Volume2 } from 'lucide-react';

export default function VideoPlayer({ source, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleProgress = (event) => {
    const video = videoRef.current;
    if (!video) return;
    const nextProgress = Number(event.target.value);
    video.currentTime = (nextProgress / 100) * video.duration;
    setProgress(nextProgress);
  };

  const handleVolume = (event) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(event.target.value);
    video.volume = value;
    setVolume(value);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const enterPiP = async () => {
    const video = videoRef.current;
    if (video && document.pictureInPictureEnabled && !video.disablePictureInPicture) {
      await video.requestPictureInPicture();
    }
  };

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-3xl bg-black ring-1 ring-white/10 shadow-2xl"
    >
      <video
        ref={videoRef}
        src={source}
        poster={poster}
        controls={false}
        className="w-full h-full"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgress}
          className="w-full accent-primary"
        />
        <div className="mt-3 flex items-center justify-between text-sm">
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 hover:bg-white/20 transition"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Pause' : 'Lecture'}
          </button>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
              <Volume2 className="w-4 h-4" />
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} />
            </label>
            <button onClick={enterPiP} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
              <PictureInPicture className="w-4 h-4" />
            </button>
            <button onClick={enterFullscreen} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
