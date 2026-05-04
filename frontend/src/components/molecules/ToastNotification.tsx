// Componente: ToastNotification
// - Muestra notificaciones flotantes (success/error/info)
// - Reproduce un sonido de notificación si `playSound` está activo y la preferencia
//   global del usuario (localStorage) lo permite.
// Nota sobre audio: los navegadores pueden bloquear la reproducción automática. Para
// permitir audio reliably, el usuario debe interactuar con la página (ej. pulsar
// el botón de `SoundToggle`). El sistema intenta varias estrategias (HTMLAudio,
// WebAudio) y atrapar errores silenciosamente para no romper la UX.
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { isSoundEnabled, playTone, playSoundFromUrl } from '../../utils/audio';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastNotificationProps {
  variant: ToastVariant;
  title: string;
  message: string;
  onClose: () => void;
  playSound?: boolean;
  soundUrl?: string;
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-100/70',
  error: 'border-rose-200 bg-rose-50 text-rose-950 shadow-rose-100/70',
  info: 'border-sky-200 bg-sky-50 text-sky-950 shadow-sky-100/70',
};

function renderIcon(variant: ToastVariant) {
  const iconClass = 'h-10 w-10 rounded-2xl flex items-center justify-center';

  if (variant === 'success') {
    return (
      <div className={`${iconClass} bg-emerald-100 text-emerald-700`}>
        <CheckCircle2 size={20} />
      </div>
    );
  }

  if (variant === 'error') {
    return (
      <div className={`${iconClass} bg-rose-100 text-rose-700`}>
        <AlertTriangle size={20} />
      </div>
    );
  }

  return (
    <div className={`${iconClass} bg-sky-100 text-sky-700`}>
      <Info size={20} />
    </div>
  );
}

export function ToastNotification({
  variant,
  title,
  message,
  onClose,
  playSound = false,
  soundUrl,
}: ToastNotificationProps) {
  useEffect(() => {
    // Respetar: 1) el prop `playSound` y 2) la preferencia global guardada en localStorage.
    if (!playSound) return;
    if (!isSoundEnabled()) return;

    let isMounted = true;

    // Función que intenta reproducir el sonido configurado. Capturamos errores
    // porque fallos en reproducción no deben afectar la notificación visual.
    const playAudio = async () => {
      try {
        if (soundUrl) {
          await playSoundFromUrl(soundUrl);
          return;
        }

        // Si no se proporcionó URL, usamos un tono sintetizado corto.
        playTone(variant);
      } catch {
        // Ignorar errores de audio (políticas del navegador, recursos faltantes, etc.).
      }
    };

    if (isMounted) {
      void playAudio();
    }

    return () => {
      isMounted = false;
    };
  }, [playSound, variant, soundUrl]);

  return (
    <div className="fixed right-6 top-6 z-[60] w-[min(92vw,26rem)]">
      <div
        className={`rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur ${variantClasses[variant]}`}
      >
        <div className="flex items-start gap-3">
          {renderIcon(variant)}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm opacity-80">{message}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors"
                aria-label="Cerrar notificacion"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
