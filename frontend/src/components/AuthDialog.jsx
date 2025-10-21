import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthDialog({ open, onClose, onLogin, onRegister, error }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', displayName: '' });
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    try {
      if (mode === 'login') {
        await onLogin(form.username, form.password);
      } else {
        await onRegister(form);
      }
      onClose();
      setForm({ username: '', password: '', email: '', displayName: '' });
    } finally {
      setPending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-surface-elevated p-8 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                </h2>
                <p className="text-sm text-white/60">YouTube.lol fonctionne 100% hors ligne.</p>
              </div>
              <button className="text-white/40 hover:text-white" onClick={onClose}>
                Fermer
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/60">Nom d'utilisateur</label>
                <input
                  required
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-2 focus:border-primary focus:ring-0"
                />
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/60">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-2 focus:border-primary focus:ring-0"
                  />
                </div>
              )}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/60">Nom public</label>
                  <input
                    value={form.displayName}
                    onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-2 focus:border-primary focus:ring-0"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/60">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-2 focus:border-primary focus:ring-0"
                />
              </div>
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-white/60 hover:text-white"
                  onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
                >
                  {mode === 'login' ? "Créer un compte" : 'J ai déjà un compte'}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {mode === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              </div>
            </form>
            <div className="mt-6 text-xs text-white/40 space-y-1">
              <p>Comptes de démonstration :</p>
              <p>Admin · utilisateur: <code>admin</code> / mot de passe: <code>admin123</code></p>
              <p>Créateur · utilisateur: <code>creator</code> / mot de passe: <code>creator123</code></p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
