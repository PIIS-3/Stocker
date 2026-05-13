import { Plus, Users as UsersIcon, Copy, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { Button, StatusBadge, RoleBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  ActionButtons,
  TableToolbar,
  TablePagination,
  ConfirmDeleteModal,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { UserForm, CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Queries y Hooks ────────────────────────────────────────────────────────
import {
  employeesListOptions,
  useDeleteEmployee,
  rolesListOptions,
} from '../../queries/employees.queries';
import { useCrud } from '../../hooks/useCrud';
import type { EmployeeApi } from '../../services/employees.service';
import { authService } from '../../services/auth.service';

const columnHelper = createColumnHelper<EmployeeApi>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Página: UsersList
 * Gestión de empleados y usuarios del sistema refactorizada con useCrud.
 */
export default function UsersList() {
  const [roleFilter, setRoleFilter] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const canEdit = authService.can('edit', 'users');
  const canDelete = authService.can('delete', 'users');

  const handleCopy = (e: React.MouseEvent, text: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Lógica de Datos ──────────────────────────────────────────────────────
  const { data: allEmployees = [], isLoading, error } = useQuery(employeesListOptions());
  const { data: roles = [] } = useQuery(rolesListOptions());

  const filteredEmployees = useMemo(() => {
    let result = allEmployees;
    if (roleFilter !== 0) {
      result = result.filter((e) => e.role_id === roleFilter);
    }
    return result;
  }, [allEmployees, roleFilter]);

  const deleteMutation = useDeleteEmployee();

  const {
    searchTerm,
    pagination,
    selectedItem,
    itemToDelete,
    isDeleting,
    notification,
    modalStates,
    setSearchTerm,
    setPagination,
    setItemToDelete,
    openCreate,
    openEdit,
    openView,
    openDelete,
    closeModals,
    closeNotification,
    handleSuccess,
    confirmDelete,
    paginationData,
  } = useCrud<EmployeeApi>({
    moduleKey: 'users',
    itemNameKey: 'username',
    data: filteredEmployees,
    onDelete: async (item) => {
      await deleteMutation.mutateAsync(item.id_employee);
    },
  });

  const { totalPages, totalItems } = paginationData;

  // ── Columnas ─────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseColumns: ColumnDef<EmployeeApi, any>[] = [
      columnHelper.accessor('username', {
        header: 'Usuario',
        size: 150,
        cell: (info) => {
          const username = info.getValue();
          const id = info.row.original.id_employee;
          const isCopied = copiedId === id;

          return (
            <div className="flex items-center gap-2 group/copy">
              <span className="font-medium text-brand" title={username}>
                @{username}
              </span>
              <button
                onClick={(e) => handleCopy(e, username, id)}
                className={`p-1.5 rounded-md transition-all ${
                  isCopied
                    ? 'text-emerald-500 bg-emerald-50'
                    : 'text-gray-400 hover:text-brand hover:bg-brand/5 opacity-0 group-hover/copy:opacity-100'
                }`}
                title="Copiar usuario"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
        id: 'full_name',
        header: 'Nombre Completo',
        size: 200,
        cell: (info) => (
          <span className="text-gray-900 font-medium" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.role?.role_name, {
        id: 'role_name',
        header: 'Rol',
        size: 120,
        cell: (info) => (
          <div title={info.getValue() || 'Sin Rol'}>
            <RoleBadge role={info.getValue() || 'Sin Rol'} />
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.store?.store_name, {
        id: 'store_name',
        header: 'Tienda',
        size: 180,
        cell: (info) => (
          <span className="text-gray-600" title={info.getValue() || ''}>
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 120,
        cell: (info) => (
          <StatusBadge status={info.getValue()} activeLabel="Activo" inactiveLabel="Inactivo" />
        ),
      }),
    ];

    if (canEdit || canDelete) {
      baseColumns.push(
        columnHelper.display({
          id: 'actions',
          size: 100,
          header: 'Acciones',
          cell: (info) => (
            <ActionButtons
              onEdit={() => openEdit(info.row.original)}
              onDelete={() => openDelete(info.row.original)}
              hideEdit={!canEdit}
              hideDelete={!canDelete}
            />
          ),
        })
      );
    }

    return baseColumns;
  }, [openEdit, openDelete, canEdit, canDelete, copiedId]);

  return (
    <CrudPageTemplate
      title="Empleados"
      subtitle="Administra las cuentas de acceso, roles y asignaciones de tienda."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={openCreate}>
          Nuevo Empleado
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o @usuario..."
      notification={notification}
      onNotificationClose={closeNotification}
      errorMessage={error ? 'No se pudieron cargar los empleados.' : null}
      tableToolbar={
        <TableToolbar
          id="users-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) =>
            setPagination({ ...pagination, pageSize: size, pageIndex: 0 })
          }
        >
          <div className="flex items-center gap-2">
            <UsersIcon size={16} className="text-gray-400" />
            <select
              title="Filtrar por rol"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(Number(e.target.value));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-brand"
            >
              <option value={0}>Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id_role} value={role.id_role}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </TableToolbar>
      }
      table={
        <CrudTable
          data={filteredEmployees}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          globalFilter={searchTerm}
          onRowClick={openView}
        />
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.pageIndex + 1}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(updater) => {
            const nextPageIndex =
              typeof updater === 'function' ? updater(pagination.pageIndex + 1) - 1 : updater - 1;
            setPagination((prev) => ({ ...prev, pageIndex: nextPageIndex }));
          }}
          isLoading={isLoading}
        />
      }
    >
      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Revocar Acceso"
        itemName={itemToDelete ? `@${itemToDelete.username}` : ''}
        isLoading={isDeleting}
      />

      <UserForm
        isOpen={modalStates.isCreateOpen}
        onClose={closeModals}
        mode="create"
        onSuccess={(action, data) => handleSuccess(action, data, 'Usuario')}
      />

      <UserForm
        isOpen={modalStates.isEditOpen}
        onClose={closeModals}
        mode="edit"
        initialData={selectedItem}
        onSuccess={(action, data) => handleSuccess(action, data, 'Usuario')}
      />

      <UserForm
        isOpen={modalStates.isViewOpen}
        onClose={closeModals}
        mode="view"
        initialData={selectedItem}
      />
    </CrudPageTemplate>
  );
}
