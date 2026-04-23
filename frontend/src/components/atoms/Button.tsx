import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
  ghost: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  danger: 'text-gray-400 hover:text-rose-600 hover:bg-rose-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-8 py-4 text-lg rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
