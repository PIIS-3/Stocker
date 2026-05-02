import React from 'react';

interface TableToolbarProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  children?: React.ReactNode;
  id?: string;
}

/**
 * Componente TableToolbar: Parte superior de la tabla con selector de tamaño.
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  children,
  id = 'page-size',
}) => {
  const selectId = `${id}-select`;
  return (
    <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
      <div className="flex items-center gap-4">
        {/* Selector de Tamaño de Página */}
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-sm text-gray-600 font-medium">
            Mostrar:
          </label>
          <select
            id={selectId}
            title="Cantidad de registros por página"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 pr-8 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:20px]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">por página</span>
        </div>
      </div>

      {/* Slot para filtros adicionales u otros componentes */}
      {children && (
        <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
          {children}
        </div>
      )}
    </div>
  );
};
