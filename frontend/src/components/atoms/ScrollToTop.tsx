import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que desplaza la ventana hacia arriba cuando cambia la ruta.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
