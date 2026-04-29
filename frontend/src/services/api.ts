import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const normalizedApiBaseUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// ── Instancia base de Axios ─────────────────────────────────────────
// Centraliza la configuración de las peticiones HTTP a la API.
// Todos los servicios deben usar esta instancia en lugar de axios directamente.
const api = axios.create({
  // La URL base se lee de la variable de entorno VITE_API_URL.
  // Si la variable no incluye /api, se añade automáticamente.
  baseURL: normalizedApiBaseUrl,
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

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
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
        console.warn('[API] No autorizado — 401');
        localStorage.removeItem('token');
        // Redirigir a login si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      if (status >= 500) {
        console.error('[API] Error del servidor —', status);
      }
    } else if (error.request) {
      // La petición se envió pero no se recibió respuesta (servidor caído, red, etc.)
      console.error('[API] Sin respuesta del servidor');
    }

    return Promise.reject(error);
  }
);

export default api;
