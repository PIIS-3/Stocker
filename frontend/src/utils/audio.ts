// Utilidades para las preferencias de sonido de notificación y desbloqueo de reproducción de audio.
// Mantiene la lógica aislada para que los componentes puedan centrarse en la interfaz (diseño atómico).

export const SOUND_PREF_KEY = 'notifySoundEnabled';

/**
 * Verifica si el sonido está habilitado en el almacenamiento local.
 * Por defecto devuelve true si no hay preferencia guardada.
 */
export function isSoundEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(SOUND_PREF_KEY);
    if (raw === null) return true; // por defecto: habilitado
    return raw === '1' || raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Guarda la preferencia de sonido en el almacenamiento local.
 */
export function setSoundEnabled(value: boolean) {
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, value ? '1' : '0');
  } catch {
    /* ignore localStorage errors */
  }
}

/**
 * Intenta desbloquear la reproducción de audio reanudando un AudioContext o reproduciendo
 * un buffer corto y silencioso. Debe llamarse desde un gesto de usuario (clic) para
 * cumplir con las políticas de reproducción automática (autoplay) de los navegadores.
 */
export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined') return;

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Crea un pequeño buffer silencioso y lo reproduce una vez para desbloquear el audio
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);

    // Cierra el contexto después de un breve tiempo de espera
    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore close errors */
      }
    }, 500);
  } catch {
    // ignorar fallos; el desbloqueo debe ser "best-effort"
  }
}

/**
 * Mejor intento: reproducir un fragmento muy corto del MP3 usando HTMLAudio.
 * Esto se ejecuta en el mismo gesto de usuario y aumenta la probabilidad de que
 * los navegadores permitan la reproducción de audio posterior.
 */
export async function unlockAudioWithHtmlAudio(sampleUrl = '/sounds/notification-chime.mp3') {
  if (typeof window === 'undefined') return;

  try {
    // Crea un elemento de audio y baja el volumen para no molestar al usuario.
    const audio = new window.Audio(sampleUrl);
    audio.volume = 0.02; // volumen muy bajo para cebado
    audio.preload = 'auto';

    // Intenta reproducirlo brevemente. Debe llamarse desde un gesto de usuario.
    const p = audio.play();
    if (p !== undefined) {
      await p;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* ignore pause errors */
      }
    }
  } catch {
    // Silenciar errores: esto es solo un intento adicional.
  }
}

/**
 * Reproduce un archivo de audio desde una URL usando HTMLAudio (más compatible).
 */
export async function playSoundFromUrl(soundUrl: string) {
  if (typeof window === 'undefined') return;

  try {
    // Primero intentamos obtener el recurso para detectar errores (404, 500, CORS)
    const resp = await fetch(soundUrl, { method: 'GET' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    // Reproducir desde un blob URL puede evitar ciertos problemas de streaming.
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const audio = new window.Audio();
    audio.src = objectUrl;
    audio.preload = 'auto';

    await audio.play();
    // Liberar el object URL tras reproducir (o tras un timeout corto)
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch (err) {
    // Propagar el error original para diagnóstico.
    if (err instanceof Error) throw err;
    throw new Error('No se pudo reproducir audio con HTMLAudio.', { cause: err });
  }
}

/**
 * Reproduce un tono corto usando WebAudio API. `variant` decide el timbre.
 */
export function playTone(variant: 'success' | 'error' | 'info' = 'success') {
  if (typeof window === 'undefined') return;

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') void ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = variant === 'error' ? 'sawtooth' : 'sine';
    oscillator.frequency.value = variant === 'success' ? 840 : variant === 'error' ? 320 : 620;

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.24);

    oscillator.onended = () => {
      try {
        void ctx.close();
      } catch {
        /* ignore close errors */
      }
    };
  } catch {
    // Ignorar errores; función es best-effort.
  }
}
