import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import ChannelPage from './pages/ChannelPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import api from './lib/api.js';
import AuthDialog from './components/AuthDialog.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ytlol_token'));
  const [authError, setAuthError] = useState(null);
  const [authOpen, setAuthOpen] = useState(() => !token);

  useEffect(() => {
    if (!token) {
      setAuthOpen(true);
      setUser(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || '{}'));
      setUser({
        username: payload.username,
        role: payload.role,
        verified: payload.verified,
        displayName: payload.username
      });
      setAuthOpen(false);
    } catch (error) {
      console.error('Invalid token payload', error);
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      setToken(response.data.token);
      localStorage.setItem('ytlol_token', response.data.token);
      setUser(response.data.user);
      setAuthError(null);
    } catch (error) {
      setAuthError('Identifiants incorrects');
    }
  };

  const register = async ({ username, password, email, displayName }) => {
    const response = await api.post('/register', {
      username,
      password,
      email,
      displayName
    });
    setToken(response.data.token);
    localStorage.setItem('ytlol_token', response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('ytlol_token');
    setUser(null);
    setToken(null);
  };

  return (
    <>
      <Routes>
        <Route element={<Layout user={user} onLoginClick={() => setAuthOpen(true)} onLogout={logout} />}>
          <Route index element={<HomePage />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="channel/:username" element={<ChannelPage />} />
          <Route
            path="admin"
            element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={login}
        onRegister={register}
        error={authError}
      />
    </>
  );
}
