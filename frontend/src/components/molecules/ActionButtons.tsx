import { Edit2, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onEdit}
        className="p-2 text-gray-400 hover:text-brand transition-colors rounded-lg hover:bg-brand/10"
      >
        <Edit2 size={18} />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
