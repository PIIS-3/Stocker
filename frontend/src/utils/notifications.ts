// Utilidades para las preferencias de notificaciones visuales.
// Mantiene la lógica aislada para que los componentes puedan centrarse en la interfaz.

export const NOTIFICATIONS_PREF_KEY = 'visualNotificationsEnabled';

/**
 * Verifica si las notificaciones visuales están habilitadas en el almacenamiento local.
 * Por defecto devuelve true si no hay preferencia guardada.
 */
export function isNotificationsEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_PREF_KEY);
    if (raw === null) return true; // por defecto: habilitado
    return raw === '1' || raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Guarda la preferencia de notificaciones en el almacenamiento local.
 */
export function setNotificationsEnabled(value: boolean) {
  try {
    window.localStorage.setItem(NOTIFICATIONS_PREF_KEY, value ? '1' : '0');
  } catch {
    /* ignore localStorage errors */
  }
}
