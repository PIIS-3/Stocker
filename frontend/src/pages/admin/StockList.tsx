import { useMemo, useState } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { StatusBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  TableToolbar,
  TablePagination,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

interface StockMock {
  id_stock: number;
  product: string;
  store: string;
  quantity: number;
  min_quantity: number;
  status: 'Óptimo' | 'Bajo' | 'Agotado';
}

const mockStock: StockMock[] = [
  {
    id_stock: 1,
    product: 'Laptop XYZ',
    store: 'Tienda Central',
    quantity: 45,
    min_quantity: 10,
    status: 'Óptimo',
  },
  {
    id_stock: 2,
    product: 'Mouse Inalámbrico',
    store: 'Sucursal Norte',
    quantity: 5,
    min_quantity: 15,
    status: 'Bajo',
  },
  {
    id_stock: 3,
    product: 'Monitor 24"',
    store: 'Tienda Central',
    quantity: 0,
    min_quantity: 5,
    status: 'Agotado',
  },
  {
    id_stock: 4,
    product: 'Teclado Mecánico',
    store: 'Sucursal Sur',
    quantity: 20,
    min_quantity: 10,
    status: 'Óptimo',
  },
];

const columnHelper = createColumnHelper<StockMock>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function StockList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const filteredStock = useMemo(() => {
    return mockStock.filter((stock) =>
      stock.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.store.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const columns = useMemo(() => {
    const baseColumns: ColumnDef<StockMock, any>[] = [
      columnHelper.accessor('id_stock', {
        header: 'ID',
        size: 80,
      }),
      columnHelper.accessor('product', {
        header: 'Producto',
        size: 250,
      }),
      columnHelper.accessor('store', {
        header: 'Tienda/Sucursal',
        size: 200,
      }),
      columnHelper.accessor('quantity', {
        header: 'Cantidad Actual',
        size: 150,
      }),
      columnHelper.accessor('min_quantity', {
        header: 'Stock Mínimo',
        size: 150,
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 120,
        cell: (info) => {
          const status = info.getValue();
          let color = '';
          if (status === 'Óptimo') color = 'bg-green-100 text-green-800';
          if (status === 'Bajo') color = 'bg-yellow-100 text-yellow-800';
          if (status === 'Agotado') color = 'bg-red-100 text-red-800';
          
          return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
              {status}
            </span>
          );
        },
      }),
    ];

    return baseColumns;
  }, []);

  return (
    <CrudPageTemplate
      title="Stock de Productos"
      subtitle="Visualiza y controla el inventario de productos en todas las sucursales."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por producto o tienda..."
      tableToolbar={
        <TableToolbar
          id="stock-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) =>
            setPagination({ ...pagination, pageSize: size, pageIndex: 0 })
          }
        />
      }
      table={
        <CrudTable
          data={filteredStock}
          columns={columns}
          isLoading={false}
          pagination={pagination}
          onPaginationChange={setPagination}
          globalFilter={searchTerm}
        />
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.pageIndex + 1}
          totalPages={Math.ceil(filteredStock.length / pagination.pageSize)}
          totalItems={filteredStock.length}
          pageSize={pagination.pageSize}
          onPageChange={(updater) => {
            const nextPageIndex =
              typeof updater === 'function' ? updater(pagination.pageIndex + 1) - 1 : updater - 1;
            setPagination((prev) => ({ ...prev, pageIndex: nextPageIndex }));
          }}
          isLoading={false}
        />
      }
    />
  );
}
