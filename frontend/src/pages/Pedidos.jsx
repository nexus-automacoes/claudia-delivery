import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useOrders, useUpdateOrderStatus, useCreateOrder } from '../hooks/useOrders';
import useSocket from '../hooks/useSocket';
import Button from '../components/ui/Button';
import OrderKanban from '../components/orders/OrderKanban';
import OrderModal from '../components/orders/OrderModal';

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Novos' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'READY', label: 'Prontos' },
  { value: 'DISPATCHED', label: 'Em Entrega' },
  { value: 'DELIVERED', label: 'Entregues' },
];

function OrdersSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-50/80 rounded-xl min-w-[280px] w-[280px] p-3 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          {[...Array(2)].map((_, j) => (
            <div key={j} className="bg-white rounded-xl p-4 mb-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-200 rounded-full w-12" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Pedidos() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const filters = {};
  if (statusFilter) filters.status = statusFilter;
  if (dateFilter) filters.date = dateFilter;

  const { data: ordersData, isLoading } = useOrders(filters);
  const updateStatus = useUpdateOrderStatus();
  const createOrder = useCreateOrder();

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data || [];

  // Socket.io real-time events
  const handleNewOrder = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    toast.success('Novo pedido recebido!', { icon: '🔔' });
  }, [queryClient]);

  const handleOrderUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderStats'] });
  }, [queryClient]);

  useSocket({
    new_order: handleNewOrder,
    order_updated: handleOrderUpdated,
  });

  // Status change handler from Kanban
  function handleStatusChange(orderId, newStatus) {
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success('Status atualizado com sucesso!');
        },
        onError: () => {
          toast.error('Erro ao atualizar status.');
        },
      }
    );
  }

  // Create order handler
  function handleCreateOrder(data) {
    createOrder.mutate(data, {
      onSuccess: () => {
        toast.success('Pedido criado com sucesso!');
        setIsModalOpen(false);
      },
      onError: () => {
        toast.error('Erro ao criar pedido.');
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie e acompanhe os pedidos em tempo real
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 bg-white"
        />

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <OrdersSkeleton />
      ) : (
        <OrderKanban
          orders={orders}
          onStatusChange={handleStatusChange}
          onOrderClick={(order) => {
            // Future: open order detail modal
          }}
        />
      )}

      {/* New Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
        isSubmitting={createOrder.isPending}
      />
    </div>
  );
}
