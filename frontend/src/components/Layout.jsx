import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Upload, Bell, Menu } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function Layout({ user, onLoginClick, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-surface text-white">
      <Sidebar collapsed={collapsed} isAdmin={user?.role === 'admin'} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 flex flex-col gap-4 bg-surface/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3 sm:px-10">
            <div className="flex items-center gap-3">
              <button
                className="sm:hidden inline-flex items-center justify-center rounded-full bg-white/10 p-2"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="text-lg font-semibold">
                YouTube<span className="text-primary">.lol</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-6">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Rechercher des vidéos"
                  className="w-full rounded-full bg-white/10 pl-10 pr-4 py-2 border border-white/10 focus:border-primary focus:ring-0"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <button className="hidden lg:inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition">
                <Upload className="w-4 h-4" />
                Mettre en ligne
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative rounded-full bg-white/10 p-2 hover:bg-white/20 transition">
                <Bell className="w-5 h-5" />
              </button>
              {user ? (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-600 grid place-items-center text-sm font-semibold">
                    {user?.displayName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="hidden sm:inline">Se déconnecter</span>
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold shadow-lg shadow-primary/40"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
          <div className="flex md:hidden px-4 pb-3">
            <div className="relative flex-1">
              <input
                key={location.pathname}
                type="search"
                placeholder="Rechercher des vidéos"
                className="w-full rounded-full bg-white/10 pl-10 pr-4 py-2 border border-white/10 focus:border-primary focus:ring-0"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
