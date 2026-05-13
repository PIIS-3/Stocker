import { Save, Shield, Store as StoreIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateEmployee,
  useUpdateEmployee,
  rolesListOptions,
} from '../../queries/employees.queries';
import { storesListOptions } from '../../queries/stores.queries';
import type { EmployeeCreate, EmployeeApi } from '../../services/employees.service';
import { authService } from '../../services/auth.service';

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
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const isReadOnly = isView;
  const currentUser = authService.getUser();
  const isManager = currentUser?.role === 'Manager';

  // ── Configuración de TanStack Form ──
  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      status: 'Active',
      role_id: 0,
      store_id: isManager ? currentUser?.id_store || 0 : 0,
      password: '',
      confirm_password: '',
    },
    onSubmit: async ({ value }) => {
      if (isReadOnly) return;
      setError(null);

      try {
        const action: UserFormAction = isEdit ? 'update' : 'create';
        let savedEmployee: EmployeeApi;

        const payload = { ...value } as Record<string, unknown>;
        delete payload.confirm_password;

        if (isEdit) {
          delete payload.password;
        }

        if (isEdit && initialData) {
          savedEmployee = await updateMutation.mutateAsync({
            id: initialData.id_employee,
            data: payload as unknown as EmployeeCreate,
          });
        } else {
          savedEmployee = await createMutation.mutateAsync(payload as unknown as EmployeeCreate);
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
      }
    },
  });

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  // ── Carga de Dependencias con TanStack Query ──
  const { data: roles = [] } = useQuery({
    ...rolesListOptions(),
    enabled: isOpen,
  });

  const { data: stores = [] } = useQuery({
    ...storesListOptions(0, 1000),
    enabled: isOpen,
  });

  // ── Sincronización de Datos Iniciales ──
  useEffect(() => {
    if (isOpen) {
      if ((isEdit || isView) && initialData) {
        form.reset({
          first_name: initialData.first_name,
          last_name: initialData.last_name,
          username: initialData.username,
          status: initialData.status,
          role_id: initialData.role_id,
          store_id: initialData.store_id,
          password: '',
          confirm_password: '',
        });
      } else {
        form.reset({
          first_name: '',
          last_name: '',
          username: '',
          status: 'Active',
          role_id: 0,
          store_id: isManager ? currentUser?.id_store || 0 : 0,
          password: '',
          confirm_password: '',
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, isEdit, isView, form, isManager, currentUser?.id_store]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
      <form
        className="p-6 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ID + Datos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {initialData && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                readOnly
                value={`#${initialData.id_employee}`}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-mono outline-none w-full"
              />
            </div>
          )}
          <div
            className={`flex flex-col gap-1.5 ${initialData ? 'sm:col-span-5' : 'sm:col-span-6'}`}
          >
            <label className="text-sm font-medium text-gray-700" htmlFor="user-first_name">
              Nombre {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <form.Field
              name="first_name"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre es requerido' : undefined),
              }}
              children={(field) => (
                <>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    required
                    readOnly={isReadOnly}
                    placeholder="Ej: Juan"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                      isReadOnly
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-brand'
                    }`}
                  />
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 mt-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </>
              )}
            />
          </div>
          <div
            className={`flex flex-col gap-1.5 ${initialData ? 'sm:col-span-5' : 'sm:col-span-6'}`}
          >
            <label className="text-sm font-medium text-gray-700" htmlFor="user-last_name">
              Apellidos {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <form.Field
              name="last_name"
              validators={{
                onChange: ({ value }) => (!value ? 'Los apellidos son requeridos' : undefined),
              }}
              children={(field) => (
                <>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    required
                    readOnly={isReadOnly}
                    placeholder="Ej: García Pérez"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                      isReadOnly
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-brand'
                    }`}
                  />
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 mt-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </>
              )}
            />
          </div>
        </div>

        {/* Username y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-username">
              Nombre de Usuario {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre de usuario es requerido' : undefined),
              }}
              children={(field) => (
                <>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      @
                    </span>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      required
                      readOnly={isReadOnly}
                      placeholder="jgarcia"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                        isReadOnly
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                          : 'focus:ring-2 focus:ring-brand'
                      }`}
                    />
                  </div>
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 mt-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-status">
              Estado de la Cuenta
            </label>
            <form.Field
              name="status"
              children={(field) => (
                <select
                  id={field.name}
                  name={field.name}
                  disabled={isReadOnly}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                    isReadOnly
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'focus:ring-2 focus:ring-brand'
                  }`}
                >
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Contraseña (Solo en creación) */}
        {!isEdit && !isView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-password">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'La contraseña es requerida'
                      : value.length < 8
                        ? 'Mínimo 8 caracteres'
                        : undefined,
                }}
                children={(field) => (
                  <>
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                    />
                    {field.state.meta.errors ? (
                      <em className="text-[10px] text-rose-500 mt-1 font-medium">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-confirm_password">
                Confirmar Contraseña <span className="text-rose-500">*</span>
              </label>
              <form.Field
                name="confirm_password"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return 'Debes confirmar la contraseña';
                    if (value !== fieldApi.form.getFieldValue('password')) {
                      return 'Las contraseñas no coinciden';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <>
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                    />
                    {field.state.meta.errors ? (
                      <em className="text-[10px] text-rose-500 mt-1 font-medium">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </>
                )}
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
            <form.Field
              name="role_id"
              validators={{
                onChange: ({ value }) => (value === 0 ? 'El rol es requerido' : undefined),
              }}
              children={(field) => (
                <div className="relative">
                  <Shield
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    id={field.name}
                    name={field.name}
                    required
                    disabled={isReadOnly}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
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
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 mt-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-store_id">
              Tienda Asignada {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <form.Field
              name="store_id"
              validators={{
                onChange: ({ value }) => (value === 0 ? 'La tienda es requerida' : undefined),
              }}
              children={(field) => (
                <div className="relative">
                  <StoreIcon
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    id={field.name}
                    name={field.name}
                    required
                    disabled={isReadOnly || isManager}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                      isReadOnly || isManager
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
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 mt-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
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
