import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useStore from '../../store/useStore';

const pageTitles = {
  '/': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/cardapio': 'Cardapio',
  '/clientes': 'Clientes',
  '/entregadores': 'Entregadores',
  '/broadcast': 'Broadcast',
};

export default function Layout() {
  const location = useLocation();
  const { sidebarOpen } = useStore();

  // Derive page title from current path
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const title = pageTitles[basePath] || 'Claudia Delivery';

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-body">
      <Sidebar />

      {/* Main content area */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        <Header title={title} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
