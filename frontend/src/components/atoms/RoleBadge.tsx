const roleStyles: Record<string, string> = {
  SuperAdmin: 'border-purple-200 text-purple-700 bg-purple-50',
  Manager: 'border-blue-200 text-blue-700 bg-blue-50',
  Staff: 'border-emerald-200 text-emerald-700 bg-emerald-50',
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
