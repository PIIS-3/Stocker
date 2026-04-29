import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoUrl from '../assets/logo_no_bg.png';
import { authService } from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  // Pre-rellenado para facilitar el desarrollo
  const [username, setUsername] = useState('carlos.garcia');
  const [password, setPassword] = useState('stocker123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(username, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      let message = 'Error al iniciar sesión. Verifique sus credenciales.';
      
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="flex justify-center mb-6">
          <img
            src={logoUrl}
            alt="Stocker Logo"
            className="h-16 w-16 object-contain mix-blend-multiply"
          />
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión en su cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">Acceso exclusivo para empleados</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-brand/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent sm:text-sm transition-all"
                  placeholder="Ej. alopez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand checked:border-brand checked:bg-brand transition-all cursor-pointer"
                  />
                  <svg
                    className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transform scale-50 peer-checked:scale-100 transition-all duration-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  Recordarme
                </span>
              </label>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-brand hover:text-brand-dark transition-colors"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand/20 text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cargando...' : 'Ingresar al Sistema'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
