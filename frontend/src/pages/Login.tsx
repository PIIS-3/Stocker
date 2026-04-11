import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoUrl from '../assets/logo_no_bg.png';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logoUrl} alt="Stocker" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-slate-400 mt-2">Acceso exclusivo para empleados</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Nombre de usuario</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 disabled:opacity-60"
          >
            {submitting ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link to="/" className="hover:text-white">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}