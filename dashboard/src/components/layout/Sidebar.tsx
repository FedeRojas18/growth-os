import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Users, TrendingUp } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/targets', label: 'Targets', icon: Target },
  { to: '/partners', label: 'Partners', icon: Users },
];

export function Sidebar() {
  return (
    <aside className="w-60 gradient-sidebar text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight">Growth OS</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Bitcoin Ecosystem</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                      ${isActive ? 'bg-indigo-500/20' : 'bg-transparent'}
                    `}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
