import { useState, useCallback, useEffect, useRef } from 'react';
import type { ToastVariant } from '../components/molecules/ToastNotification';
import { isNotificationsEnabled } from '../utils/notifications';

interface NotificationState {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Hook personalizado para gestionar el estado de las notificaciones tipo Toast.
 * Centraliza la lógica de auto-ocultado y limpieza de timeouts.
 */
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((variant: ToastVariant, title: string, message: string) => {
    if (!isNotificationsEnabled()) return;

    // Limpiar timeout previo si existe para evitar solapamientos
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({
      id: Date.now(),
      variant,
      title,
      message,
    });

    // Auto-ocultar después de 3.8 segundos (coincide con la animación actual)
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, 3800);
  }, []);

  const close = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    notification,
    show,
    close,
  };
}
