import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
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
  isLoading = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors gap-2 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
