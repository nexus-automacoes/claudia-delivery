import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Truck,
  Send,
  MessageCircle,
  LogOut,
  ChefHat,
  X,
} from 'lucide-react';
import useStore from '../../store/useStore';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/cardapio', label: 'Cardapio', icon: UtensilsCrossed },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/entregadores', label: 'Entregadores', icon: Truck },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Send },
  { to: '/admin/whatsapp', label: 'WhatsApp Bot', icon: MessageCircle, green: true },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Logo section */}
        <div className="relative flex items-center gap-3 px-6 py-7 border-b border-white/[0.06]">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <ChefHat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-primary tracking-tight leading-none">
              Claudia
            </h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
              Delivery
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <span className="px-3 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-3 block">
            Menu
          </span>
          {navItems.map(({ to, label, icon: Icon, green }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                    : green
                      ? 'text-[#25D366] hover:text-[#20BF5B] hover:bg-white/[0.05]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${green ? 'bg-[#25D366] shadow-[0_0_8px_rgba(37,211,102,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(255,107,53,0.4)]'}`} />
                  )}
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? green ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-primary/15 text-primary'
                          : green
                            ? 'text-[#25D366] group-hover:text-[#20BF5B] group-hover:bg-white/[0.05]'
                            : 'text-gray-400 group-hover:text-gray-200 group-hover:bg-white/[0.05]'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className="tracking-wide">{label}</span>
                  {/* Hover glow effect */}
                  {isActive && (
                    <span className={`absolute inset-0 rounded-xl pointer-events-none ${green ? 'bg-[#25D366]/[0.03]' : 'bg-primary/[0.03]'}`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="relative mx-6 border-t border-white/[0.06]" />

        {/* Logout section */}
        <div className="relative px-3 py-4">
          <button
            onClick={logout}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-red-500/10 transition-all duration-200">
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </span>
            <span className="tracking-wide">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
