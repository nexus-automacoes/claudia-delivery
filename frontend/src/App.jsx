import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Storefront from './pages/Storefront';
import LinkTree from './pages/LinkTree';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Cardapio from './pages/Cardapio';
import Clientes from './pages/Clientes';
import Entregadores from './pages/Entregadores';
import Broadcast from './pages/Broadcast';
import WhatsAppConnect from './pages/admin/WhatsAppConnect';
import CardapioArte from './pages/CardapioArte';
import useStore from './store/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { token } = useStore();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ROTA PUBLICA - Cardapio Digital */}
          <Route path="/" element={<Storefront />} />
          <Route path="/links" element={<LinkTree />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* AREA ADMIN (protegida) */}
          <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="cardapio" element={<Cardapio />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="entregadores" element={<Entregadores />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="whatsapp" element={<WhatsAppConnect />} />
            <Route path="cardapio-arte" element={<CardapioArte />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
