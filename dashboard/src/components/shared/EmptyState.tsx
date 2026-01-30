import type { ReactNode } from 'react';
import { Inbox, Target, Users, FileQuestion } from 'lucide-react';

type IconName = 'inbox' | 'target' | 'users' | 'file';

interface EmptyStateProps {
  icon?: IconName | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

const iconComponents: Record<IconName, typeof Inbox> = {
  inbox: Inbox,
  target: Target,
  users: Users,
  file: FileQuestion,
};

function isIconName(icon: IconName | ReactNode): icon is IconName {
  return typeof icon === 'string' && icon in iconComponents;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  const IconComponent = isIconName(icon) ? iconComponents[icon] : null;

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      ${compact ? 'py-8' : 'py-12'}
    `}>
      <div className={`
        flex items-center justify-center rounded-full bg-gray-100 mb-4
        ${compact ? 'w-10 h-10' : 'w-12 h-12'}
      `}>
        {IconComponent ? (
          <IconComponent className={`text-gray-400 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
        ) : (
          icon
        )}
      </div>
      <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-gray-500 mt-1 max-w-sm ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export function EmptyColumn({ message = 'No items' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mb-2">
        <Inbox className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
