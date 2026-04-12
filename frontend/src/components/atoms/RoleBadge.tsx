const roleStyles: Record<string, string> = {
  DB_Admin: 'border-purple-200 text-purple-700 bg-purple-50',
  Store_Admin: 'border-blue-200 text-blue-700 bg-blue-50',
};

const defaultStyle = 'border-gray-200 text-gray-600 bg-gray-50';

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium border ${
        roleStyles[role] ?? defaultStyle
      }`}
    >
      {role}
    </span>
  );
}
