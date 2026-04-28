import { Save, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

/**
 * Componente: UserForm
 * Formulario modal para la gestión de usuarios (empleados).
 * Permite definir roles, tiendas asignadas y credenciales de acceso.
 */
export function UserForm({ isOpen, onClose, mode = 'create' }: UserFormProps) {
  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
      subtitle={
        isEdit ? 'Modifica los datos del usuario.' : 'Registra un nuevo empleado en el sistema.'
      }
      size="md"
    >
      <form className="p-6 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        {/* Nombre + Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-name">
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              placeholder="Ej: Ana López"
              defaultValue={isEdit ? 'Ana López' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-username">
              Usuario <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                @
              </span>
              <input
                id="user-username"
                type="text"
                placeholder="alopez"
                defaultValue={isEdit ? 'alopez' : ''}
                className="pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="user-email">
            Correo Electrónico <span className="text-rose-500">*</span>
          </label>
          <input
            id="user-email"
            type="email"
            placeholder="Ej: ana.lopez@stocker.com"
            defaultValue={isEdit ? 'ana.lopez@stocker.com' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Contraseña (solo en creación) */}
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-password">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="user-confirm-password">
                Repetir Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-confirm-password"
                type="password"
                placeholder="Repite la contraseña"
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Rol + Tienda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-role">
              Rol <span className="text-rose-500">*</span>
            </label>
            <select
              id="user-role"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
              defaultValue={isEdit ? 'Store_Admin' : ''}
            >
              <option value="" disabled>
                Seleccionar rol
              </option>
              <option value="DB_Admin">Administrador (DB)</option>
              <option value="Store_Admin">Manager de Tienda</option>
              <option value="Worker">Trabajador</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="user-store">
              Tienda Asignada
            </label>
            <select
              id="user-store"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
              defaultValue={isEdit ? 'madrid' : ''}
            >
              <option value="">Sin asignación (Todas)</option>
              <option value="madrid">Madrid Centro</option>
              <option value="barcelona">Barcelona Norte</option>
              <option value="valencia">Valencia Playa</option>
            </select>
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="user-status">
            Estado
          </label>
          <select
            id="user-status"
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
            defaultValue="Active"
          >
            <option value="Active">Activo</option>
            <option value="Inactive">Inactivo</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} icon={<X size={16} />}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={16} />}>
            {isEdit ? 'Guardar Cambios' : 'Crear Empleado'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
