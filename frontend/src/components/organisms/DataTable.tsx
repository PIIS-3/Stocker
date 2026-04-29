import React from 'react';
import { Loader2 } from 'lucide-react';

interface DataTableProps {
  columns: string[];
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  expectedRows?: number;
  rowCount?: number;
  children: React.ReactNode;
}

/**
 * Componente DataTable: Organismo que renderiza la estructura de la tabla,
 * manejando estados de carga, error y filas vacías para mantener la altura.
 */
export const DataTable: React.FC<DataTableProps> = ({
  columns,
  isLoading,
  errorMessage,
  emptyMessage = 'No hay datos para mostrar.',
  expectedRows = 5,
  rowCount = 0,
  children,
}) => {
  const TABLE_ROW_HEIGHT = 48;
  const TABLE_HEADER_HEIGHT = 48;

  return (
    <div
      className="overflow-x-auto overflow-y-auto"
      style={{
        maxHeight: `${expectedRows * (TABLE_ROW_HEIGHT + 1) + TABLE_HEADER_HEIGHT + 1}px`,
      }}
    >
      <table className="w-full min-w-[760px] text-left border-collapse">
        <thead>
          <tr className="h-12 bg-gray-50 text-gray-500 text-sm sticky top-0">
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-3 py-0 align-middle font-medium border-b border-gray-100 ${
                  index === columns.length - 1 ? 'text-right' : ''
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm">
          {/* Estado de Carga */}
          {isLoading && (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 p-6 text-center text-gray-500 align-middle"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Cargando datos...</span>
                </div>
              </td>
            </tr>
          )}

          {/* Estado Vacío */}
          {!isLoading && !errorMessage && rowCount === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 p-6 text-center text-gray-500 align-middle"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {/* Renderizado de Filas de Datos */}
          {!isLoading && !errorMessage && children}

          {/* Relleno de Filas Vacías */}
          {!isLoading &&
            !errorMessage &&
            rowCount > 0 &&
            Array.from({ length: Math.max(0, expectedRows - rowCount) }).map((_, index) => (
              <tr
                key={`empty-${index}`}
                className={`h-12 border-b border-gray-50 ${
                  (rowCount + index) % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td colSpan={columns.length} />
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
