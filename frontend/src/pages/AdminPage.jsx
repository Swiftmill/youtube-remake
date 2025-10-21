import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trash2, CheckCircle, Award, Gauge } from 'lucide-react';

export default function AdminPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyUser, setVerifyUser] = useState('');
  const [quotaUser, setQuotaUser] = useState('');
  const [quotaLimit, setQuotaLimit] = useState(500);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pending', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Not authorized');
        return response.json();
      })
      .then((data) => setPending(data.pending))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const approve = async (videoId) => {
    const response = await fetch(`/api/admin/videos/${videoId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
      },
      body: JSON.stringify({})
    });
    if (response.ok) {
      setPending((items) => items.filter((item) => item.id !== videoId));
    }
  };

  const reject = async (videoId) => {
    const response = await fetch(`/api/admin/videos/${videoId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
      }
    });
    if (response.ok) {
      setPending((items) => items.filter((item) => item.id !== videoId));
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!verifyUser) return;
    const response = await fetch(`/api/admin/users/${verifyUser}/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
      }
    });
    if (response.ok) {
      setToast(`@${verifyUser} est désormais vérifié`);
      setVerifyUser('');
    }
  };

  const handleQuota = async (event) => {
    event.preventDefault();
    if (!quotaUser) return;
    const response = await fetch(`/api/admin/users/${quotaUser}/quota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
      },
      body: JSON.stringify({ limit: Number(quotaLimit) })
    });
    if (response.ok) {
      setToast(`Quota mis à jour pour @${quotaUser}`);
      setQuotaUser('');
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="h-24 w-full rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <p className="text-white/60">Accès refusé. Connectez-vous en tant qu'admin.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-10">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Panel d'administration</h1>
          <p className="text-white/60 text-sm">
            Validez les nouvelles vidéos, gérez les quotas et attribuez des badges vérifiés.
          </p>
        </div>
      </div>
      {toast && (
        <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {toast}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <motion.form
          layout
          onSubmit={handleVerify}
          className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-semibold">Attribuer un badge vérifié</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Confirmez les créateurs officiels afin d'afficher le badge bleu partout sur la plateforme.
          </p>
          <div className="flex flex-col gap-3">
            <input
              value={verifyUser}
              onChange={(event) => setVerifyUser(event.target.value)}
              placeholder="Nom d'utilisateur"
              className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm focus:border-primary focus:ring-0"
            />
            <button
              type="submit"
              className="self-start rounded-full bg-primary px-4 py-2 text-sm font-semibold shadow-lg shadow-primary/40"
            >
              Vérifier
            </button>
          </div>
        </motion.form>
        <motion.form
          layout
          onSubmit={handleQuota}
          className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-semibold">Limiter le stockage</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Ajustez la limite de stockage (en Mo) pour un créateur afin de maîtriser l'espace disque.
          </p>
          <div className="grid gap-3">
            <input
              value={quotaUser}
              onChange={(event) => setQuotaUser(event.target.value)}
              placeholder="Nom d'utilisateur"
              className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm focus:border-primary focus:ring-0"
            />
            <input
              type="number"
              min="100"
              step="50"
              value={quotaLimit}
              onChange={(event) => setQuotaLimit(event.target.value)}
              className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm focus:border-primary focus:ring-0"
            />
            <button
              type="submit"
              className="self-start rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Enregistrer le quota
            </button>
          </div>
        </motion.form>
      </div>
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Vidéos en attente</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="text-white/50 text-sm">Aucune vidéo en attente pour le moment.</p>
        ) : (
          <div className="space-y-6">
            {pending.map((video) => (
              <motion.article
                key={video.id}
                layout
                className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl shadow-xl shadow-black/30"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <img
                    src={
                      video.thumbnailPath ||
                      'https://placehold.co/320x180/0f0f0f/ffffff?text=Miniature+en+attente'
                    }
                    alt={video.title}
                    className="h-40 w-full md:w-56 rounded-2xl object-cover bg-black/40"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">{video.title}</h3>
                      <p className="text-sm text-white/60">Proposé par {video.uploader}</p>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-3">{video.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      {video.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-3 py-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => approve(video.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30"
                      >
                        <CheckCircle className="w-4 h-4" /> Valider
                      </button>
                      <button
                        onClick={() => reject(video.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" /> Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
