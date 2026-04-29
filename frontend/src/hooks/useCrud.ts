import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook personalizado para gestionar la lógica de un CRUD con paginación local.
 */
export function useCrud<T>(
  fetchFn: () => Promise<T[]>,
  deleteFn?: (id: number) => Promise<unknown>,
  initialPageSize = 5
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Función de carga reutilizable para refrescos manuales o tras acciones
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchFn();
      setItems(data);
    } catch {
      setErrorMessage('No se pudieron cargar los datos. Reintenta en unos segundos.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  // Efecto de carga inicial usando el patrón recomendado por React (ignore boolean)
  // para evitar actualizaciones de estado en componentes desmontados y asegurar
  // que la actualización ocurra después del primer ciclo de renderizado.
  useEffect(() => {
    let isIgnore = false;

    const startFetch = async () => {
      try {
        const data = await fetchFn();
        if (!isIgnore) {
          setItems(data);
          setErrorMessage(null);
          setIsLoading(false);
        }
      } catch {
        if (!isIgnore) {
          setErrorMessage('No se pudieron cargar los datos.');
          setIsLoading(false);
        }
      }
    };

    void startFetch();

    return () => {
      isIgnore = true;
    };
  }, [fetchFn]);

  // Lógica de paginación
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (visiblePage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, visiblePage, pageSize]);

  const remove = async (id: number) => {
    if (!deleteFn) return;
    await deleteFn(id);
    await refresh();
  };

  return {
    items: paginatedItems,
    allItems: items,
    isLoading,
    errorMessage,
    pagination: {
      currentPage: visiblePage,
      totalPages,
      pageSize,
      totalItems,
      setPage: setCurrentPage,
      setPageSize: (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
      },
    },
    refresh,
    remove,
  };
}
