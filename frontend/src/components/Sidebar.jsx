import { NavLink } from 'react-router-dom';
import { Home, PlaySquare, UserCheck, Shield } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/channel/creator', icon: PlaySquare, label: 'Chaînes' },
  { to: '/admin', icon: Shield, label: 'Admin', admin: true }
];

export default function Sidebar({ collapsed = false, isAdmin = false }) {
  return (
    <nav
      className={clsx('hidden sm:flex flex-col gap-2 py-6 px-4 transition-all duration-300 bg-black/50 backdrop-blur-lg', {
        'w-72': !collapsed,
        'w-20 items-center': collapsed
      })}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center text-primary font-semibold">
          YL
        </div>
        {!collapsed && <span className="text-lg font-semibold">YouTube.lol</span>}
      </div>
      {links
        .filter((link) => (link.admin ? isAdmin : true))
        .map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/10',
                { 'bg-white/10 text-white': isActive }
              )
            }
          >
            <Icon className="w-5 h-5" />
            {!collapsed && label}
          </NavLink>
        ))}
    </nav>
  );
}
