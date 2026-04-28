import { Link } from 'react-router-dom';
import { Logo } from '../atoms/Logo';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <div className="mb-6">
          <Logo showBg />
        </div>

        <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
          SGA para optimizar almacenes y tiendas físicas de manera inteligente y en tiempo real.
        </p>

        <ul className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400">
          <li>
            <Link to="/privacy" className="hover:text-brand transition-colors">
              Política de Privacidad
            </Link>
          </li>
          <li>
            <Link to="/terms" className="hover:text-brand transition-colors">
              Términos de Servicio
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-brand transition-colors">
              Contacto
            </Link>
          </li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Stocker. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
