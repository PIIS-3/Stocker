import { ArrowRight, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoadmapCTA = () => {
  return (
    <section className="min-h-screen flex items-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-brand-50 rounded-2xl mb-8 text-brand-600 ring-1 ring-brand-100">
          <Map size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Construyendo en Abierto
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-500 mb-10">
          Nuestro desarrollo es 100% transparente. Explora el roadmap interactivo del proyecto,
          revisa los sprints completados y descubre las características de grado empresarial en las
          que estamos trabajando ahora mismo.
        </p>
        <Link
          to="/roadmap"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 hover:-translate-y-0.5 transition-all duration-200"
        >
          Explorar el Roadmap
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};
