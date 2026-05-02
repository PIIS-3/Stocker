import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../atoms/Logo';

export function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Logo to="/" />

        {/* Menú de escritorio */}
        <div className="hidden md:flex items-center gap-8">
          {isHome && (
            <Link
              to="/login"
              className="bg-brand text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-dark transition-all shadow-md shadow-brand/30"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Botón menú móvil */}
        <button className="md:hidden text-gray-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4">
          {isHome && (
            <Link
              to="/login"
              className="bg-brand text-white px-5 py-2 rounded-lg font-medium w-full mt-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
