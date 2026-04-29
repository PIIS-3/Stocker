import { Plus, Users as UsersIcon } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { Button, StatusBadge, RoleBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  ActionButtons,
  TableToolbar,
  TablePagination,
  ConfirmDeleteModal,
  type ToastVariant,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { UserForm, DataTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Servicios y Hooks ───────────────────────────────────────────────────────
import { employeesService, type EmployeeApi } from '../../services/employees.service';
import { rolesService, type RoleApi } from '../../services/roles.service';
import { useCrud } from '../../hooks/useCrud';

// ── Configuración ───────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface NotificationState {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Página: UsersList
 * Gestión de empleados y usuarios del sistema.
 * Implementa filtros por rol y búsqueda por nombre/usuario.
 */
export default function UsersList() {
  // ── Lógica de Negocio (CRUD) ──────────────────────────────────────────────
  const fetchEmployees = useCallback(() => employeesService.getEmployees(0, 1000), []);
  const deleteEmployee = useCallback((id: number) => employeesService.deleteEmployee(id), []);

  const {
    items: employees,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<EmployeeApi>(fetchEmployees, deleteEmployee);

  // ── Estados de Interfaz (UI) ──────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EmployeeApi | null>(null);
  const [userToDelete, setUserToDelete] = useState<EmployeeApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<number>(0);
  const [roles, setRoles] = useState<RoleApi[]>([]);

  // ── Carga de Roles para Filtro ──
  useEffect(() => {
    void rolesService.getRoles().then(setRoles);
  }, []);

  // ── Manejadores de Eventos (Handlers) ────────────────────────────────────

  const showNotification = useCallback((variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  const handleUserSuccess = (action: 'create' | 'update', user: EmployeeApi) => {
    void refresh();
    showNotification(
      'success',
      action === 'create' ? 'Usuario creado' : 'Usuario actualizado',
      `${user.first_name} ${user.last_name} ha sido guardado correctamente.`
    );
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await remove(userToDelete.id_employee);
      showNotification(
        'success',
        'Usuario eliminado',
        `El acceso de ${userToDelete.username} ha sido revocado.`
      );
      setUserToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario.';
      showNotification('error', 'Error', message);
    }
  };

  // ── Filtrado Local ───────────────────────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 0 || emp.role_id === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ── Renderizado ──────────────────────────────────────────────────────────

  return (
    <CrudPageTemplate
      title="Empleados"
      subtitle="Administra las cuentas de acceso, roles y asignaciones de tienda."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nuevo Empleado
        </Button>
      }
      // Búsqueda
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o @usuario..."
      // Notificaciones
      notification={notification}
      onNotificationClose={() => setNotification(null)}
      errorMessage={errorMessage}
      // Configuración de Tabla
      tableToolbar={
        <TableToolbar
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={pagination.setPageSize}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          {/* Filtro de Rol Adicional */}
          <div className="flex items-center gap-2">
            <UsersIcon size={16} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(Number(e.target.value))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-brand"
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
        <DataTable
          columns={['Usuario', 'Nombre Completo', 'Rol', 'Tienda', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={filteredEmployees.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No se encontraron empleados con los filtros actuales."
        >
          {filteredEmployees.map((emp, index) => (
            <tr
              key={emp.id_employee}
              onClick={() => {
                setSelectedUser(emp);
                setIsViewOpen(true);
              }}
              className={`h-14 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-0 align-middle">
                <span className="font-medium text-brand">@{emp.username}</span>
              </td>
              <td className="px-4 py-0 align-middle">
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    {emp.first_name} {emp.last_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-0 align-middle">
                <RoleBadge role={emp.role?.role_name || 'Sin Rol'} />
              </td>
              <td className="px-4 py-0 align-middle text-gray-600">
                {emp.store?.store_name || '-'}
              </td>
              <td className="px-4 py-0 align-middle">
                <StatusBadge status={emp.status} activeLabel="Activo" inactiveLabel="Inactivo" />
              </td>
              <td className="px-4 py-0 align-middle">
                <ActionButtons
                  onEdit={() => {
                    setSelectedUser(emp);
                    setIsEditOpen(true);
                  }}
                  onDelete={() => setUserToDelete(emp)}
                />
              </td>
            </tr>
          ))}
        </DataTable>
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={filteredEmployees.length} // Usamos el total filtrado para la UI
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          isLoading={isLoading}
        />
      }
    >
      {/* Modales de Acción */}

      <ConfirmDeleteModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Revocar Acceso"
        itemName={`@${userToDelete?.username}`}
        isLoading={isLoading}
      />

      <UserForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        onSuccess={handleUserSuccess}
      />

      <UserForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        mode="edit"
        initialData={selectedUser}
        onSuccess={handleUserSuccess}
      />

      <UserForm
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedUser(null);
        }}
        mode="view"
        initialData={selectedUser}
      />
    </CrudPageTemplate>
  );
}
