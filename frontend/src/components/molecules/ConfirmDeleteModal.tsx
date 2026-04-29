import { Trash2 } from 'lucide-react';
import { Button } from '../atoms';
import { Modal } from './Modal';

interface ConfirmDeleteModalProps {
  /** Indica si el modal está visible */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función que se ejecuta al confirmar la eliminación */
  onConfirm: () => void;
  /** Título del modal (ej: "Eliminar tienda") */
  title: string;
  /** Nombre del ítem a eliminar (ej: "Almacén Madrid") */
  itemName?: string;
  /** Estado de carga durante la eliminación */
  isLoading?: boolean;
}

/**
 * Molécula: ConfirmDeleteModal
 * Modal estandarizado para confirmaciones de borrado destructivo.
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 flex flex-col gap-5">
        {/* Banner de Advertencia */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-rose-100 p-2 text-rose-700">
              <Trash2 size={18} />
            </div>
            <div>
              <p className="font-semibold">¿Eliminar {itemName || 'este registro'}?</p>
              <p className="mt-1 text-sm text-rose-800/90">
                Esta acción no se puede deshacer y podría afectar a otros registros vinculados.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            icon={<Trash2 size={16} />}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
