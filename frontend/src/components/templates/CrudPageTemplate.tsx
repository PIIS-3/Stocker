import { type ReactNode } from 'react';
import { SearchInput } from '../molecules/SearchInput';
import { ToastNotification, type ToastVariant } from '../molecules/ToastNotification';

interface CrudPageTemplateProps {
  /** Título principal de la página */
  title: string;
  /** Subtítulo o descripción corta */
  subtitle: string;
  /** Elemento de acción principal (ej: Botón "Nuevo") */
  headerAction?: ReactNode;
  /** Valor del buscador */
  searchValue?: string;
  /** Callback cuando cambia el buscador */
  onSearchChange?: (value: string) => void;
  /** Placeholder para el buscador */
  searchPlaceholder?: string;
  /** Contenido del toolbar de la tabla */
  tableToolbar: ReactNode;
  /** El componente de tabla (DataTable) */
  table: ReactNode;
  /** El componente de paginación (TablePagination) */
  tablePagination: ReactNode;
  /** Estado de notificación global */
  notification?: {
    id: number;
    title: string;
    message: string;
    variant: ToastVariant;
  } | null;
  /** Función para cerrar la notificación */
  onNotificationClose?: () => void;
  /** Mensaje de error global si existe */
  errorMessage?: string | null;
  /** Contenido adicional (Modales, etc) */
  children?: ReactNode;
}

/**
 * Template: CrudPageTemplate
 * Define la estructura visual estándar para todas las páginas de gestión (CRUD).
 * Centraliza el diseño del encabezado, buscador, contenedor de tabla y notificaciones.
 */
export function CrudPageTemplate({
  title,
  subtitle,
  headerAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  tableToolbar,
  table,
  tablePagination,
  notification,
  onNotificationClose,
  errorMessage,
  children,
}: CrudPageTemplateProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      {/* Notificaciones flotantes */}
      {notification && onNotificationClose && (
        <ToastNotification
          {...notification}
          onClose={onNotificationClose}
          playSound
          soundUrl="/sounds/notification-chime.mp3"
        />
      )}

      {/* Encabezado de Página */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-gray-500">{subtitle}</p>
        </div>
        {headerAction}
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex items-center justify-start gap-3 shrink-0">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
          className="w-full md:w-96"
        />
      </div>

      {/* Contenedor Principal de Datos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* Toolbar de la tabla (Paginación superior / Refresh) */}
        {tableToolbar}

        {/* Alerta de Error de API */}
        {errorMessage && (
          <div className="p-4 text-rose-700 bg-rose-50 border-b border-rose-100 animate-in fade-in slide-in-from-top-1 duration-200">
            {errorMessage}
          </div>
        )}

        {/* Tabla de Datos */}
        <div className="flex-1 flex flex-col min-h-0">
          {table}
        </div>

        {/* Paginación Inferior */}
        {tablePagination}
      </div>

      {/* Slots para Modales y otros elementos fuera del flujo principal */}
      {children}
    </div>
  );
}
