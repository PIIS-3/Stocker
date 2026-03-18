import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo_no_bg.png';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        
        <Link to="/" className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Stocker Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-white">Stocker</span>
        </Link>
        
        <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
          SGA para optimizar almacenes y tiendas físicas de manera inteligente y en tiempo real.
        </p>

        <ul className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400">
          <li><Link to="/privacidad" className="hover:text-brand transition-colors">Política de Privacidad</Link></li>
          <li><Link to="/terminos" className="hover:text-brand transition-colors">Términos de Servicio</Link></li>
          <li><Link to="/contacto" className="hover:text-brand transition-colors">Contacto</Link></li>
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
