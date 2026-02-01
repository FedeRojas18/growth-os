interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'bitwage' | 'teampay' | 'mining' | 'success' | 'warning' | 'error' | 'info'
    | 'stage-new' | 'stage-contacted' | 'stage-replied' | 'stage-meeting' | 'stage-passed';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  default: 'bg-slate-200 text-slate-800 ring-slate-300',
  bitwage: 'bg-blue-50 text-blue-700 ring-blue-200',
  teampay: 'bg-amber-50 text-amber-700 ring-amber-200',
  mining: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  error: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  'stage-new': 'bg-blue-200 text-blue-800 ring-blue-300',
  'stage-contacted': 'bg-indigo-200 text-indigo-800 ring-indigo-300',
  'stage-replied': 'bg-amber-200 text-amber-900 ring-amber-300',
  'stage-meeting': 'bg-orange-200 text-orange-900 ring-orange-300',
  'stage-passed': 'bg-emerald-200 text-emerald-900 ring-emerald-300',
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
  'stage-new': 'bg-blue-500',
  'stage-contacted': 'bg-indigo-500',
  'stage-replied': 'bg-amber-500',
  'stage-meeting': 'bg-orange-500',
  'stage-passed': 'bg-emerald-500',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs font-semibold',
  md: 'px-2.5 py-0.5 text-xs font-semibold',
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

export function getStageVariant(stage: string): BadgeProps['variant'] {
  switch (stage) {
    case 'New':
      return 'stage-new';
    case 'Contacted':
      return 'stage-contacted';
    case 'Replied':
      return 'stage-replied';
    case 'Meeting':
      return 'stage-meeting';
    case 'Passed':
      return 'stage-passed';
    default:
      return 'default';
  }
}
