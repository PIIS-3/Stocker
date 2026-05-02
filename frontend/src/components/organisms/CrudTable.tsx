import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface CrudTableProps<T> {
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  globalFilter?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Componente CrudTable: Organismo que implementa TanStack Table v8.
 * Maneja sorting, filtrado global y paginación controlada.
 */
export function CrudTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No hay datos para mostrar.',
  pagination,
  onPaginationChange,
  globalFilter = '',
  onRowClick,
}: CrudTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // Paginación cliente por ahora
    enableSortingRemoval: false, // Solo ciclar entre ascendente y descendente
    autoResetPageIndex: false, // No reiniciar la página al actualizar datos
  });

  // Sincronizar el número total de páginas con el componente padre si fuera necesario,
  // pero TanStack Table ya lo calcula si manualPagination es false.

  const rowModel = table.getRowModel();
  const rowCount = rowModel.rows.length;

  const pageSize = pagination?.pageSize || 5;
  const ALTURA_FILA = 48; // El usuario puede cambiar este valor para pruebas
  const tableHeight =
    pageSize === 5 ? ALTURA_FILA * 5 + ALTURA_FILA : ALTURA_FILA * 8 + ALTURA_FILA;

  const minRows = pageSize === 5 ? 5 : 8;

  const getSortTooltip = (sortState: string | boolean) => {
    if (sortState === 'asc') return 'Ordenado ascendente — clic para descendente';
    if (sortState === 'desc') return 'Ordenado descendente — clic para ascendente';
    return 'Clic para ordenar ascendente';
  };

  return (
    <div
      className="overflow-x-auto overflow-y-auto"
      style={{ height: tableHeight, minHeight: tableHeight, maxHeight: tableHeight }}
    >
      <table className="w-full min-w-[760px] text-left border-collapse table-fixed">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="bg-gray-50 text-gray-500 text-sm sticky top-0 z-10"
              style={{ height: ALTURA_FILA }}
            >
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                const isActions = header.column.id === 'actions';
                return (
                  <th
                    key={header.id}
                    className={`px-3 py-0 align-middle font-medium border-b border-gray-100 ${
                      canSort ? 'cursor-pointer select-none' : ''
                    } ${isActions ? 'sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.02)]' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.column.columnDef.size || 'auto' }}
                  >
                    <div className={`flex items-center gap-1.5 ${isActions ? 'justify-end w-full' : ''}`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-gray-400" title={getSortTooltip(sortState)}>
                          {{
                            asc: <ArrowUp size={14} />,
                            desc: <ArrowDown size={14} />,
                          }[sortState as string] ?? <ArrowUpDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
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
          {!isLoading && rowCount === 0 && (
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
          {!isLoading &&
            rowModel.rows.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    // Solo activar si el foco está en la fila misma, no en sus botones internos
                    if (e.target !== e.currentTarget) return;
                    e.preventDefault();
                    onRowClick(row.original);
                  }
                }}
                tabIndex={onRowClick ? 0 : -1}
                className={`group outline-none transition-colors border-b border-gray-50 ${
                  onRowClick ? 'cursor-pointer focus:bg-brand/[0.08]' : ''
                } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                style={{ height: ALTURA_FILA }}
              >
                {row.getVisibleCells().map((cell) => {
                  const isActions = cell.column.id === 'actions';
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-0 align-middle transition-colors group-focus:bg-brand/[0.08] ${
                        isActions
                          ? `sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.02)] ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } group-hover:bg-gray-100 group-focus:bg-brand/[0.08]`
                          : ''
                      }`}
                      style={{ height: ALTURA_FILA, maxWidth: 0 }}
                    >
                      <div
                        className={`flex items-center w-full h-full overflow-hidden ${
                          isActions ? 'justify-end pr-2' : ''
                        }`}
                        style={{ maxHeight: ALTURA_FILA }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

          {/* Relleno de Filas Vacías para mantener colores alternos y altura */}
          {!isLoading &&
            rowCount > 0 &&
            Array.from({ length: Math.max(0, minRows - rowCount) }).map((_, index) => (
              <tr
                key={`empty-${index}`}
                className={`border-b border-gray-50 ${
                  (rowCount + index) % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                style={{ height: ALTURA_FILA }}
              >
                <td colSpan={columns.length} />
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
