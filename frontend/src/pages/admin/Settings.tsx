import React, { useState, useEffect } from 'react';
import {
  Bell,
  Moon,
  Sun,
  User,
  Lock,
  Globe,
  ShieldCheck,
  Smartphone,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { authService } from '../../services/auth.service';

const Settings = () => {
  useEffect(() => {
    document.title = 'Ajustes de Usuario | Stocker';
  }, []);

  const user = authService.getUser();
  const username = user?.username || 'Usuario';
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ajustes de Usuario</h1>
          <p className="text-gray-500 mt-2">Personaliza tu experiencia y gestiona la seguridad de tu cuenta.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand/5 text-brand rounded-full text-sm font-medium border border-brand/10">
          <User size={16} />
          Sesión iniciada como {username}
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Appearance Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Palette size={20} />
            </div>
            Apariencia del Sistema
          </h2>

          <div className="flex-1 space-y-6">
            <p className="text-sm text-gray-500">
              Personaliza el aspecto visual de la plataforma según tu preferencia o el entorno de luz.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button className="border-2 border-brand p-5 rounded-2xl flex flex-col items-center gap-3 bg-brand/5 transition-all">
                <Sun className="text-brand" size={24} />
                <span className="font-bold text-brand">Modo Claro</span>
              </button>
              <button className="border-2 border-gray-50 p-5 rounded-2xl flex flex-col items-center gap-3 hover:bg-gray-50 transition-all group">
                <Moon className="text-gray-400 group-hover:text-gray-600" size={24} />
                <span className="font-bold text-gray-500 group-hover:text-gray-700">Modo Oscuro</span>
              </button>
            </div>
          </div>
        </motion.section>

        {/* Notifications Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bell size={20} />
            </div>
            Notificaciones
          </h2>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Notificaciones de escritorio</p>
                <p className="text-xs text-gray-500">Alertas visuales en el navegador.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={desktopEnabled}
                  onChange={(e) => setDesktopEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>

            <div
              className={`flex items-center justify-between pt-4 border-t border-gray-50 transition-opacity duration-300 ${!desktopEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
            >
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  Efectos de sonido
                  {!desktopEnabled && (
                    <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-tighter">
                      Off
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Sonido al recibir notificaciones.</p>
              </div>
              <label
                className={`relative inline-flex items-center ${desktopEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={soundEnabled && desktopEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  disabled={!desktopEnabled}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            Seguridad y Privacidad
          </h2>

          <div className="flex-1 space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-brand/5 hover:border-brand/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-brand transition-colors">
                  <Lock size={18} />
                </div>
                <div className="text-left">
                  <p className="text-gray-800 font-bold">Cambiar contraseña</p>
                  <p className="text-xs text-gray-500">Actualiza tus credenciales de acceso.</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-brand/5 hover:border-brand/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-brand transition-colors">
                  <Smartphone size={18} />
                </div>
                <div className="text-left">
                  <p className="text-gray-800 font-bold">Doble factor (2FA)</p>
                  <p className="text-xs text-gray-500 text-pretty">Añade una capa extra de seguridad.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold uppercase tracking-tight">
                  Recomendado
                </span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Language & Region Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe size={20} />
            </div>
            Idioma y Región
          </h2>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Idioma del sistema
              </label>
              <div className="relative">
                <select className="w-full appearance-none bg-gray-50 border border-gray-100 text-gray-700 py-3.5 px-4 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer font-bold">
                  <option value="es">Español (Castellano)</option>
                  <option value="en">English (United States)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Formato de moneda
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 border-2 border-brand bg-brand/5 rounded-xl text-sm font-bold text-brand shadow-sm shadow-brand/5">
                  EUR (€) Euro
                </button>
                <button className="py-3 px-4 border-2 border-gray-100 bg-white rounded-xl text-sm font-bold text-gray-400 hover:border-gray-200 transition-colors">
                  USD ($) Dólar
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-brand/10 rounded-2xl">
                    <Lock className="text-brand" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cambiar contraseña</h3>
                    <p className="text-sm text-gray-500 text-pretty">
                      Ingresa tu contraseña actual y la nueva para actualizarla.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-[2] px-4 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand/90 transition-shadow shadow-lg shadow-brand/20"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
