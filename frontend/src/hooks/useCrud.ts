import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseCrudConfig<T> {
  initialPageSize?: number;
  filterFn?: (item: T) => boolean;
}

/**
 * Hook personalizado para gestionar la lógica de un CRUD con paginación local.
 * Soporta filtrado reactivo que reinicia la paginación automáticamente.
 */
export function useCrud<T>(
  fetchFn: () => Promise<T[]>,
  deleteFn?: (id: number) => Promise<unknown>,
  config: UseCrudConfig<T> = {}
) {
  const { initialPageSize = 5, filterFn } = config;

  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchFn();
      setAllItems(data);
    } catch {
      setErrorMessage('No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    let isIgnore = false;
    const startFetch = async () => {
      try {
        const data = await fetchFn();
        if (!isIgnore) {
          setAllItems(data);
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

  // 1. Aplicar filtro si existe
  const filteredItems = useMemo(() => {
    if (!filterFn) return allItems;
    return allItems.filter(filterFn);
  }, [allItems, filterFn]);

  // 2. Reiniciar a página 1 si el filtro cambia (y la página actual queda fuera de rango)
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reiniciar a página 1 si el filtro cambia (Patrón recomendado por React para evitar renders en cascada)
  // Nota: Envolvemos la función en otra función para que useState no la ejecute como inicializador.
  const [prevFilter, setPrevFilter] = useState<((item: T) => boolean) | undefined>(() => filterFn);

  if (filterFn !== prevFilter) {
    setPrevFilter(() => filterFn);
    setCurrentPage(1);
  }

  const visiblePage = Math.min(currentPage, totalPages);

  // 3. Paginar los elementos filtrados
  const paginatedItems = useMemo(() => {
    const startIndex = (visiblePage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, visiblePage, pageSize]);

  const remove = async (id: number) => {
    if (!deleteFn) return;
    await deleteFn(id);
    await refresh();
  };

  return {
    items: paginatedItems,
    allItems, // Por si se necesita el original
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
