import { useMemo, useState } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { FileText, Plus } from 'lucide-react';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { Button, StatusBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  ActionButtons,
  TableToolbar,
  TablePagination,
  Modal,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

interface SaleMock {
  id_sale: number;
  date: string;
  customer: string;
  total: number;
  status: 'Completada' | 'Pendiente' | 'Cancelada';
  items: Array<{ product: string; quantity: number; price: number }>;
}

const mockSales: SaleMock[] = [
  {
    id_sale: 1,
    date: '2023-10-01',
    customer: 'Juan Pérez',
    total: 150.5,
    status: 'Completada',
    items: [
      { product: 'Laptop XYZ', quantity: 1, price: 100.5 },
      { product: 'Mouse Inalámbrico', quantity: 2, price: 25.0 },
    ],
  },
  {
    id_sale: 2,
    date: '2023-10-02',
    customer: 'María García',
    total: 300.0,
    status: 'Pendiente',
    items: [{ product: 'Monitor 24"', quantity: 2, price: 150.0 }],
  },
  {
    id_sale: 3,
    date: '2023-10-03',
    customer: 'Carlos López',
    total: 50.0,
    status: 'Cancelada',
    items: [{ product: 'Teclado Mecánico', quantity: 1, price: 50.0 }],
  },
];

const columnHelper = createColumnHelper<SaleMock>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function SalesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedSale, setSelectedSale] = useState<SaleMock | null>(null);

  const filteredSales = useMemo(() => {
    return mockSales.filter((sale) =>
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const columns = useMemo(() => {
    const baseColumns: ColumnDef<SaleMock, any>[] = [
      columnHelper.accessor('id_sale', {
        header: 'ID',
        size: 80,
      }),
      columnHelper.accessor('date', {
        header: 'Fecha',
        size: 150,
      }),
      columnHelper.accessor('customer', {
        header: 'Cliente',
        size: 200,
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        size: 120,
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 120,
        cell: (info) => (
          <StatusBadge
            status={info.getValue() === 'Completada'}
            activeLabel={info.getValue()}
            inactiveLabel={info.getValue()}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        size: 100,
        cell: (info) => (
          <Button
            variant="outline"
            size="sm"
            icon={<FileText size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSale(info.row.original);
            }}
          >
            Detalles
          </Button>
        ),
      }),
    ];

    return baseColumns;
  }, []);

  return (
    <CrudPageTemplate
      title="Ventas"
      subtitle="Visualiza y gestiona el historial de ventas realizadas."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por cliente..."
      tableToolbar={
        <TableToolbar
          id="sales-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) =>
            setPagination({ ...pagination, pageSize: size, pageIndex: 0 })
          }
        />
      }
      table={
        <CrudTable
          data={filteredSales}
          columns={columns}
          isLoading={false}
          pagination={pagination}
          onPaginationChange={setPagination}
          globalFilter={searchTerm}
          onRowClick={(sale) => setSelectedSale(sale)}
        />
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.pageIndex + 1}
          totalPages={Math.ceil(filteredSales.length / pagination.pageSize)}
          totalItems={filteredSales.length}
          pageSize={pagination.pageSize}
          onPageChange={(updater) => {
            const nextPageIndex =
              typeof updater === 'function' ? updater(pagination.pageIndex + 1) - 1 : updater - 1;
            setPagination((prev) => ({ ...prev, pageIndex: nextPageIndex }));
          }}
          isLoading={false}
        />
      }
    >
      <Modal
        isOpen={selectedSale !== null}
        onClose={() => setSelectedSale(null)}
        title="Detalles de la Venta"
        subtitle={`Venta #${selectedSale?.id_sale}`}
        size="md"
      >
        {selectedSale && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{selectedSale.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{selectedSale.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <StatusBadge
                  status={selectedSale.status === 'Completada'}
                  activeLabel={selectedSale.status}
                  inactiveLabel={selectedSale.status}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium">${selectedSale.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Artículos</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-gray-600 font-medium">Producto</th>
                      <th className="px-4 py-2 text-gray-600 font-medium">Cant.</th>
                      <th className="px-4 py-2 text-gray-600 font-medium">Precio U.</th>
                      <th className="px-4 py-2 text-gray-600 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-4 py-2">{item.product}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setSelectedSale(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </CrudPageTemplate>
  );
}
