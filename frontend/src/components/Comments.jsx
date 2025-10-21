import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Comments({ videoId, comments = [] }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ytlol_token') || ''}`
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send comment');
      setMessage('');
    } catch (error) {
      console.error(error);
      alert('Impossible de poster le commentaire.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Commentaires</h2>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ajouter un commentaire public"
          className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-primary focus:ring-0"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Publier
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-6">
        {comments.map((comment) => (
          <motion.article
            key={comment.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-sm font-semibold">
              {comment.author?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{comment.author}</span>
                <span className="text-white/50 text-xs">
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  }).format(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/70">{comment.message}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
