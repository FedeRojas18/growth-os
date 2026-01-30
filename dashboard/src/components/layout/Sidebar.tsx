import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/targets', label: 'Targets', icon: '🎯' },
  { to: '/partners', label: 'Partners', icon: '🤝' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen">
      <div className="p-4">
        <div className="text-lg font-bold mb-6">Growth OS</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
