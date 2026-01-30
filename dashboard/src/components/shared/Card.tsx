import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: 'none' | 'left' | 'top';
  accentColor?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  accent = 'none',
  accentColor,
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 overflow-hidden';
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const accentClasses = accent === 'left'
    ? 'border-l-4'
    : accent === 'top'
    ? 'border-t-4'
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${accentClasses} ${paddingClasses[padding]} ${className}`}
      style={accentColor ? { borderLeftColor: accentColor, borderTopColor: accent === 'top' ? accentColor : undefined } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export function CardTitle({ children, className = '', subtitle }: CardTitleProps) {
  return (
    <div>
      <h3 className={`text-lg font-semibold text-gray-900 tracking-tight ${className}`}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
