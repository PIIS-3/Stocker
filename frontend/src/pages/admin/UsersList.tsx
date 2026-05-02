import { Plus, Users as UsersIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

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

const columnHelper = createColumnHelper<EmployeeApi>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Página: UsersList
 * Gestión de empleados y usuarios del sistema refactorizada con useCrud.
 */
export default function UsersList() {
  const [roleFilter, setRoleFilter] = useState<number>(0);

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
  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        size: 150,
        cell: (info) => (
          <span className="font-medium text-brand" title={info.getValue()}>
            @{info.getValue()}
          </span>
        ),
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
      columnHelper.display({
        id: 'actions',
        size: 100,
        header: 'Acciones',
        cell: (info) => (
          <ActionButtons
            onEdit={() => openEdit(info.row.original)}
            onDelete={() => openDelete(info.row.original)}
          />
        ),
      }),
    ],
    [openEdit, openDelete]
  );

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
