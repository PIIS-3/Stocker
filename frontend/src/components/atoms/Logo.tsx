import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo_no_bg.png';

interface LogoProps {
  /** Texto que se muestra a la derecha del logotipo */
  label?: string;
  /** Añade un fondo blanco al contenedor del icono (usado en el Footer) */
  showBg?: boolean;
  /** Tamaño del contenedor del icono en Tailwind (h-X w-X) */
  iconSize?: string;
}

export function Logo({ label = 'Stocker', showBg = false, iconSize = 'h-10 w-10' }: LogoProps) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div
        className={`${iconSize} flex items-center justify-center overflow-hidden ${
          showBg ? 'bg-white rounded' : 'mix-blend-multiply'
        }`}
      >
        <img
          src={logoUrl}
          alt="Stocker Logo"
          className={`w-full h-full ${showBg ? 'object-cover' : 'object-contain'}`}
        />
      </div>
      <span className={`text-xl font-bold ${showBg ? 'text-white' : 'text-gray-800'}`}>
        {label}
      </span>
    </Link>
  );
}
