import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer.jsx';
import Comments from '../components/Comments.jsx';
import { motion } from 'framer-motion';

export default function WatchPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/videos/${videoId}`)
      .then((response) => {
        if (!response.ok) throw new Error('Video introuvable');
        return response.json();
      })
      .then(setVideo)
      .catch(setError);
  }, [videoId]);

  if (error) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <p className="text-white/60">Impossible de charger cette vidéo.</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="aspect-video w-full rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <VideoPlayer source={video.videoPath} poster={video.thumbnailPath} />
          <div className="mt-6 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold leading-tight">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="font-semibold text-white">{video.uploaderDisplayName || video.uploader}</span>
              {video.verified && <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Vérifié</span>}
              <span>{new Intl.NumberFormat('fr-FR').format(video.views)} vues</span>
              <span>{new Date(video.publishedAt).toLocaleDateString('fr-FR')}</span>
              <div className="ml-auto flex items-center gap-2">
                <ActionButton label="J'aime" value={video.likes} />
                <ActionButton label="Je n'aime pas" value={video.dislikes} subtle />
              </div>
            </div>
            <motion.div
              layout
              className="rounded-3xl bg-white/5 border border-white/5 p-6 shadow-inner shadow-black/30"
            >
              <p className="whitespace-pre-wrap text-sm text-white/80">{video.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/50">
                {video.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
            <Comments videoId={video.id} comments={video.comments} />
          </div>
        </div>
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">À suivre</h2>
          <div className="space-y-4">
            {video.recommended?.length ? (
              video.recommended.map((item) => (
                <a
                  key={item.id}
                  href={`/watch/${item.id}`}
                  className="flex gap-3 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition"
                >
                  <img
                    src={item.thumbnailPath}
                    alt={item.title}
                    className="h-20 w-36 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
                    <p className="text-xs text-white/50">{item.uploader}</p>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-sm text-white/40">Plus de recommandations très bientôt.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActionButton({ label, value, subtle }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        subtle ? 'bg-white/5 hover:bg-white/10' : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      {label}
      <span className="text-white/70">{value}</span>
    </button>
  );
}
