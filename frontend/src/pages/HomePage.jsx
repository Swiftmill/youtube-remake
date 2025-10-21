import { motion } from 'framer-motion';
import VideoCard from '../components/VideoCard.jsx';
import { useFetch } from '../hooks/useFetch.js';

export default function HomePage() {
  const { data, loading } = useFetch('/home');
  const videos = data?.videos ?? [];

  return (
    <div className="px-4 py-8 sm:px-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">À la une</h1>
          <p className="text-white/60 text-sm">Les dernières vidéos validées par l'équipe YouTube.lol</p>
        </div>
      </div>
      {loading ? (
        <motion.div layout className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-video rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
