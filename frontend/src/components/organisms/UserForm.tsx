import { Save, Shield, Store as StoreIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import {
  employeesService,
  type EmployeeCreate,
  type EmployeeApi,
} from '../../services/employees.service';
import { rolesService, type RoleApi } from '../../services/roles.service';
import { storesService, type StoreApi } from '../../services/stores.service';

type UserFormAction = 'create' | 'update';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'view';
  initialData?: EmployeeApi | null;
  onSuccess?: (action: UserFormAction, employee: EmployeeApi) => void;
  onError?: (message: string) => void;
}

/**
 * Componente: UserForm
 * Formulario modal para la gestión de empleados.
 * Soporta modos: create, edit y view (solo lectura).
 */
export function UserForm({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSuccess,
  onError,
}: UserFormProps) {
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const isReadOnly = isView;

  // ── Estados de Datos ──
  const [formData, setFormData] = useState<EmployeeCreate & { confirm_password?: string }>({
    first_name: '',
    last_name: '',
    username: '',
    status: 'Active',
    role_id: 0,
    store_id: 0,
    hashed_password: '',
    confirm_password: '',
  });

  const [roles, setRoles] = useState<RoleApi[]>([]);
  const [stores, setStores] = useState<StoreApi[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Carga de Dependencias ──
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [rolesRes, storesRes] = await Promise.all([
          rolesService.getRoles(),
          storesService.getStores(0, 1000),
        ]);
        setRoles(rolesRes);
        setStores(storesRes);
      } catch (err) {
        console.error('Error cargando dependencias de usuario:', err);
      }
    };

    if (isOpen) {
      void loadDependencies();
    }
  }, [isOpen]);

  // ── Sincronización de Datos Iniciales ──
  useEffect(() => {
    if (isOpen) {
      if ((isEdit || isView) && initialData) {
        setFormData({
          first_name: initialData.first_name,
          last_name: initialData.last_name,
          username: initialData.username,
          status: initialData.status,
          role_id: initialData.role_id,
          store_id: initialData.store_id,
          hashed_password: '',
        });
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          username: '',
          status: 'Active',
          role_id: 0,
          store_id: 0,
          hashed_password: '',
          confirm_password: '',
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, isEdit, isView]);

  // ── Handlers ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { id, value } = e.target;
    const name = id.replace('user-', '');
    setFormData((prev) => ({
      ...prev,
      [name]: id.includes('id') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError(null);

    // Validaciones básicas
    if (!isEdit && formData.hashed_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.role_id === 0) {
      setError('Debes seleccionar un rol.');
      return;
    }

    if (formData.store_id === 0) {
      setError('Debes seleccionar una tienda.');
      return;
    }

    setIsSubmitting(true);

    try {
      const action: UserFormAction = isEdit ? 'update' : 'create';
      let savedEmployee: EmployeeApi;

      const { confirm_password: _, ...payload } = formData;
      if (isEdit) {
        delete payload.hashed_password;
      }

      if (isEdit && initialData) {
        savedEmployee = await employeesService.updateEmployee(initialData.id_employee, payload);
      } else {
        savedEmployee = await employeesService.createEmployee(payload as EmployeeCreate);
      }

      onSuccess?.(action, savedEmployee);
      onClose();
    } catch (err: unknown) {
      const message = (() => {
        const detail =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
            : undefined;

        return typeof detail === 'string' ? detail : 'Error al guardar el empleado.';
      })();
      setError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = isView
    ? 'Detalles del Empleado'
    : isEdit
      ? 'Editar Empleado'
      : 'Nuevo Empleado';
  const modalSubtitle = isView
    ? 'Información detallada del perfil de usuario.'
    : isEdit
      ? 'Actualiza los permisos y datos del usuario.'
      : 'Crea una nueva cuenta de acceso.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} subtitle={modalSubtitle} size="lg">
      <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Nombre y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-first_name">
              Nombre {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="user-first_name"
              type="text"
              required
              readOnly={isReadOnly}
              placeholder="Ej: Juan"
              value={formData.first_name}
              onChange={handleChange}
              className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                isReadOnly
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-brand'
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-last_name">
              Apellidos {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="user-last_name"
              type="text"
              required
              readOnly={isReadOnly}
              placeholder="Ej: García Pérez"
              value={formData.last_name}
              onChange={handleChange}
              className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                isReadOnly
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-brand'
              }`}
            />
          </div>
        </div>

        {/* Username y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-username">
              Nombre de Usuario {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                @
              </span>
              <input
                id="user-username"
                type="text"
                required
                readOnly={isReadOnly}
                placeholder="jgarcia"
                value={formData.username}
                onChange={handleChange}
                className={`pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-status">
              Estado de la Cuenta
            </label>
            <select
              id="user-status"
              disabled={isReadOnly}
              value={formData.status}
              onChange={handleChange}
              className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                isReadOnly
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-brand'
              }`}
            >
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Contraseña (Solo en creación) */}
        {!isEdit && !isView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-hashed_password">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-hashed_password"
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                value={formData.hashed_password}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-confirm_password">
                Confirmar Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-confirm_password"
                type="password"
                required
                placeholder="Repite la contraseña"
                value={formData.confirm_password}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
              />
            </div>
          </div>
        )}

        {/* Rol y Tienda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-role_id">
              Rol de Acceso {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Shield
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                id="user-role_id"
                required
                disabled={isReadOnly}
                value={formData.role_id}
                onChange={handleChange}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              >
                <option value={0} disabled>
                  Seleccionar rol...
                </option>
                {roles.map((role) => (
                  <option key={role.id_role} value={role.id_role}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-store_id">
              Tienda Asignada {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <StoreIcon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                id="user-store_id"
                required
                disabled={isReadOnly}
                value={formData.store_id}
                onChange={handleChange}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              >
                <option value={0} disabled>
                  Seleccionar tienda...
                </option>
                {stores.map((store) => (
                  <option key={store.id_store} value={store.id_store}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            {isView ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isView && (
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              icon={<Save size={16} />}
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Cuenta'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
