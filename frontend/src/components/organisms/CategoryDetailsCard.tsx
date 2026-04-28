import { Tag, Calendar, Info, Activity } from 'lucide-react';
import type { CategoryApi } from '../../services/categories.service';
import { StatusBadge } from '../atoms/StatusBadge';

interface CategoryDetailsCardProps {
  category: CategoryApi | null;
}

/**
 * Componente: CategoryDetailsCard
 * Muestra la información detallada de una categoría.
 */
export function CategoryDetailsCard({ category }: CategoryDetailsCardProps) {
  if (!category) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</p>
            <p className="text-lg font-bold text-gray-900">{category.category_name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <StatusBadge status={category.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Info size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {category.description || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Última actualización</p>
            <p className="text-sm text-gray-900">{formatDate(category.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
