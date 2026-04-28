import { useState } from 'react';
import { Speaker, VolumeX } from 'lucide-react';
import { Button } from '.';
import {
  isSoundEnabled,
  setSoundEnabled,
  unlockAudioWithHtmlAudio,
  unlockAudio,
} from '../../utils/audio';

// Átomo: botón para habilitar/deshabilitar los sonidos de notificación.
// Componente pequeño y enfocado siguiendo las reglas de Diseño Atómico.
export function SoundToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => isSoundEnabled());

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);

    if (next) {
      // Intento para desbloquear la reproducción de audio.
      // 1) Reproducir un fragmento muy corto vía HTMLAudio (más efectivo en muchos navegadores).
      // 2) Como respaldo, reanudar un AudioContext (WebAudio).
      await unlockAudioWithHtmlAudio();
      await unlockAudio();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="ml-2"
      aria-pressed={enabled}
      title={enabled ? 'Sonidos activados' : 'Activar sonidos'}
    >
      {enabled ? <Speaker size={16} /> : <VolumeX size={16} />}
    </Button>
  );
}
