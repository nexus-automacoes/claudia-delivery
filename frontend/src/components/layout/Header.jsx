import { Menu, Bell } from 'lucide-react';
import useStore from '../../store/useStore';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Header({ title }) {
  const { user, toggleSidebar } = useStore();
  const initials = getInitials(user?.name || user?.nome);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight leading-none">
            {title}
          </h2>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-200" />

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-bold shadow-md shadow-primary/20">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700 leading-none">
              {user?.name || user?.nome || 'Usuario'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.role || user?.cargo || 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
