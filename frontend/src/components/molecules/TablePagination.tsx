import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: (prev: number) => number) => void;
  isLoading?: boolean;
}

/**
 * Componente TablePagination: Parte inferior de la tabla con resumen de registros y navegación.
 */
export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading,
}) => {
  // Cálculo de indicadores de rango (Ej: "Mostrando 1 a 5 de 20")
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd =
    totalItems === 0 ? 0 : Math.min((currentPage - 1) * pageSize + pageSize, totalItems);

  return (
    <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
      <p className="text-xs text-gray-500">
        Mostrando {pageStart} a {pageEnd} de {totalItems} registros.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onPageChange((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1 || isLoading || totalItems === 0}
          className="disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            <span>Anterior</span>
            <ChevronLeft size={16} />
          </span>
        </Button>
        <span className="text-xs font-medium text-gray-600 px-2">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage >= totalPages || isLoading || totalItems === 0}
          className="disabled:cursor-not-allowed disabled:opacity-40"
          icon={<ChevronRight size={16} />}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
