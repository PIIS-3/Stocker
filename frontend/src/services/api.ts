import axios from 'axios';

// ── Instancia base de Axios ─────────────────────────────────────────
// Centraliza la configuración de las peticiones HTTP a la API.
// Todos los servicios deben usar esta instancia en lugar de axios directamente.
const api = axios.create({
  // La URL base se lee de la variable de entorno VITE_API_URL.
  // Si no existe (desarrollo local), usa el backend en localhost:8000.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  // Tiempo máximo de espera (en ms) antes de cancelar la petición.
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptor de Petición ─────────────────────────────────────────
// Se ejecuta ANTES de enviar cada petición al servidor.
// Útil para: logging en desarrollo, adjuntar tokens de autenticación, etc.
api.interceptors.request.use(
  (config) => {
    // En modo desarrollo, imprime en consola el método y la URL de cada petición.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Futuro: adjuntar token de autenticación aquí
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Interceptor de Respuesta ────────────────────────────────────────
// Se ejecuta DESPUÉS de recibir cada respuesta del servidor.
// Centraliza el manejo de errores HTTP comunes (401, 500+, sin respuesta).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Futuro: redirigir a login o limpiar sesión
        console.warn('[API] No autorizado — 401');
      }

      if (status >= 500) {
        console.error('[API] Error del servidor —', status);
      }
    } else if (error.request) {
      // La petición se envió pero no se recibió respuesta (servidor caído, red, etc.)
      console.error('[API] Sin respuesta del servidor');
    }

    return Promise.reject(error);
  },
);

export default api;
