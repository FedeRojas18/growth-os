interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'bitwage' | 'teampay' | 'mining' | 'success' | 'warning' | 'error';
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  bitwage: 'bg-blue-100 text-blue-800',
  teampay: 'bg-orange-100 text-orange-800',
  mining: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
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
