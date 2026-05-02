import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { useNotification } from './useNotification';

interface UseCrudOptions<T> {
  moduleKey: string;
  onDelete?: (item: T) => Promise<void>;
  itemNameKey: keyof T;
  data?: T[];
}

/**
 * Hook genérico useCrud
 * Centraliza la lógica de paginación, búsqueda, modales y notificaciones para los módulos CRUD.
 */
export function useCrud<T>({ moduleKey, onDelete, itemNameKey, data = [] }: UseCrudOptions<T>) {
  // ── Notificaciones ────────────────────────────────────────────────────────
  const { notification, show: showNotification, close: closeNotification } = useNotification();

  // ── Estado de Búsqueda y Paginación ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');

  const [pagination, setPagination] = useState<PaginationState>(() => {
    const saved = localStorage.getItem(`stocker_page_size_${moduleKey}`);
    return {
      pageIndex: 0,
      pageSize: saved ? Number(saved) : 5,
    };
  });

  // Guardar preferencia de tamaño de página específica del módulo
  useEffect(() => {
    localStorage.setItem(`stocker_page_size_${moduleKey}`, pagination.pageSize.toString());
  }, [pagination.pageSize, moduleKey]);

  // Resetear a página 1 cuando cambia la búsqueda
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // ── Estado de Modales y Selección ─────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Handlers de Acción ────────────────────────────────────────────────────
  const openCreate = useCallback(() => setIsCreateOpen(true), []);

  const openEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  }, []);

  const openView = useCallback((item: T) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  }, []);

  const openDelete = useCallback((item: T) => {
    setItemToDelete(item);
  }, []);

  const closeModals = useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelectedItem(null);
  }, []);

  const handleSuccess = useCallback(
    (action: 'create' | 'update', item: T, entityLabel: string) => {
      const itemName = String(item[itemNameKey]);
      showNotification(
        'success',
        action === 'create' ? `${entityLabel} creado` : `${entityLabel} actualizado`,
        `El registro "${itemName}" ha sido guardado correctamente.`
      );
    },
    [itemNameKey, showNotification]
  );

  const confirmDelete = async () => {
    if (!itemToDelete || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(itemToDelete);
      const itemName = String(itemToDelete[itemNameKey]);
      showNotification(
        'success',
        'Registro eliminado',
        `"${itemName}" ha sido eliminado del sistema.`
      );
      setItemToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el registro.';
      showNotification('error', 'Error', message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Cálculos de Paginación ────────────────────────────────────────────────
  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize) || 1;
    return { totalPages, totalItems };
  }, [data.length, pagination.pageSize]);

  return {
    // Estado
    searchTerm,
    pagination,
    selectedItem,
    itemToDelete,
    isDeleting,
    notification,
    modalStates: {
      isCreateOpen,
      isEditOpen,
      isViewOpen,
    },

    // Setters / Acciones
    setSearchTerm: handleSearchChange,
    setPagination,
    setSelectedItem,
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
  };
}
