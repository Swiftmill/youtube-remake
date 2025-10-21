import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import clsx from 'clsx';

export default function VideoCard({ video }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="group flex flex-col gap-3"
    >
      <Link
        to={`/watch/${video.id}`}
        className="relative overflow-hidden rounded-2xl bg-surface-elevated aspect-video shadow-xl shadow-black/40"
      >
        <img
          src={video.thumbnailPath || 'https://placehold.co/640x360?text=Thumbnail'}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-medium">
          {formatDuration(video.duration)}
        </div>
      </Link>
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-sm font-semibold">
          {video.uploader?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <Link to={`/watch/${video.id}`} className="font-semibold leading-tight line-clamp-2">
            {video.title}
          </Link>
          <div className="mt-1 text-sm text-white/60 flex items-center gap-1">
            <Link to={`/channel/${video.uploader}`} className="hover:text-white">
              {video.uploaderDisplayName || video.uploader}
            </Link>
            {video.uploaderVerified && <BadgeCheck className="w-4 h-4 text-sky-400" />}
          </div>
          <p className="text-xs text-white/50">
            {new Intl.NumberFormat('fr-FR').format(video.views)} vues ·{' '}
            {new Intl.DateTimeFormat('fr-FR', { month: 'short', day: 'numeric' }).format(
              new Date(video.publishedAt || video.createdAt)
            )}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function formatDuration(seconds = 0) {
  const duration = Number(seconds) || 0;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
