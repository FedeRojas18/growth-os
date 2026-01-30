interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'bitwage' | 'teampay' | 'mining' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
  bitwage: 'bg-blue-50 text-blue-700 ring-blue-200',
  teampay: 'bg-amber-50 text-amber-700 ring-amber-200',
  mining: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  error: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
};

const dotColors = {
  default: 'bg-gray-400',
  bitwage: 'bg-blue-500',
  teampay: 'bg-amber-500',
  mining: 'bg-emerald-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({ children, variant = 'default', size = 'md', dot }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

export function getBuVariant(buFit: string): BadgeProps['variant'] {
  const bu = buFit.toLowerCase();
  if (bu.includes('bitwage')) return 'bitwage';
  if (bu.includes('teampay')) return 'teampay';
  if (bu.includes('mining')) return 'mining';
  return 'default';
}
