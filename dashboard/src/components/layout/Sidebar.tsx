import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Target, Users, TrendingUp, Bell, ListChecks, LineChart } from 'lucide-react';
import { api } from '../../api/client';
import { ReminderCountBadge } from '../shared/ReminderBadge';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/todos', label: 'Todos', icon: ListChecks },
  { to: '/targets', label: 'Targets', icon: Target },
  { to: '/partners', label: 'Partners', icon: Users },
];

export function Sidebar() {
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    async function fetchReminders() {
      try {
        const reminders = await api.getReminders({ today: true });
        setReminderCount(reminders.length);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    }

    fetchReminders();

    // Refresh every minute
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Reminders Section */}
        {reminderCount > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Follow-ups</span>
              <div className="ml-auto">
                <ReminderCountBadge count={reminderCount} />
              </div>
            </div>
          </div>
        )}
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
