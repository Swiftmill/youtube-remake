import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import VideoCard from '../components/VideoCard.jsx';

export default function ChannelPage() {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/channel/${username}`)
      .then((response) => {
        if (!response.ok) throw new Error('Channel not found');
        return response.json();
      })
      .then(({ channel, videos }) => {
        setChannel(channel);
        setVideos(videos);
      })
      .catch(setError);
  }, [username]);

  if (error) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <p className="text-white/60">Chaîne introuvable.</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="h-40 w-full rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-br from-primary/40 to-rose-500/30" />
        <div className="px-4 sm:px-10">
          <div className="-mt-12 flex flex-col gap-6 rounded-3xl bg-surface-elevated/80 p-6 backdrop-blur-xl border border-white/10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-24 w-24 rounded-full bg-white/10 grid place-items-center text-2xl font-semibold">
                  {channel.displayName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold flex items-center gap-2">
                    {channel.displayName}
                    {channel.verified && <span className="text-xs rounded-full bg-sky-500/20 px-3 py-1">Vérifié</span>}
                  </h1>
                  <p className="text-sm text-white/60">@{channel.username}</p>
                  <p className="text-sm text-white/60">
                    {new Intl.NumberFormat('fr-FR').format(channel.subscribers || 0)} abonnés
                  </p>
                </div>
              </div>
              <button className="self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold shadow-lg shadow-primary/50">
                S'abonner
              </button>
            </div>
            <p className="text-sm text-white/70 max-w-3xl">{channel.bio}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-10 sm:px-10">
        <h2 className="text-lg font-semibold mb-6">Vidéos</h2>
        <motion.div layout className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
