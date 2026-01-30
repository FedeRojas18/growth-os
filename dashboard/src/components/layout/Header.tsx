import { useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Overview of your growth metrics and pipeline',
  },
  '/targets': {
    title: 'Targets',
    subtitle: 'Track targets from first contact through handoff',
  },
  '/partners': {
    title: 'Partners',
    subtitle: 'Manage partner relationships and pipeline',
  },
};

interface HeaderProps {
  lastUpdated?: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || pageTitles['/'];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pageInfo.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {lastUpdated
                ? `Updated ${new Date(lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
