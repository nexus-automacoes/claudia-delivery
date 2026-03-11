import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Truck, MapPin, Clock, CheckCircle, Package } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import StatsCard from '../components/ui/StatsCard';

const DELIVERY_STATUS_MAP = {
  SEARCHING: { label: 'Em busca de entregador', variant: 'pending' },
  ON_THE_WAY: { label: 'Entregador a caminho', variant: 'confirmed' },
  PICKED_UP: { label: 'Retirado', variant: 'dispatched' },
  DELIVERED: { label: 'Entregue', variant: 'delivered' },
};

function getDeliveryStatus(status) {
  return DELIVERY_STATUS_MAP[status] || { label: status, variant: 'default' };
}

export default function Entregadores() {
  const [trackingModal, setTrackingModal] = useState({ open: false, data: null, loading: false });

  // Fetch active deliveries (DISPATCHED orders)
  const {
    data: deliveriesResponse,
    isLoading: isLoadingDeliveries,
  } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => api.get('/api/orders?status=DISPATCHED'),
    refetchInterval: 15000,
  });

  // Fetch completed deliveries (DELIVERED orders)
  const {
    data: deliveredResponse,
    isLoading: isLoadingDelivered,
  } = useQuery({
    queryKey: ['deliveries-history'],
    queryFn: () => api.get('/api/orders?status=DELIVERED'),
    refetchInterval: 15000,
  });

  const deliveries = deliveriesResponse?.data || [];
  const deliveredOrders = deliveredResponse?.data || [];

  // Stats calculations
  const activeCount = deliveries.length;
  const todayCount = deliveries.filter((d) => {
    const today = new Date().toISOString().slice(0, 10);
    return d.createdAt?.slice(0, 10) === today;
  }).length + deliveredOrders.filter((d) => {
    const today = new Date().toISOString().slice(0, 10);
    return d.updatedAt?.slice(0, 10) === today;
  }).length;
  const completedCount = deliveredOrders.length;

  const handleTrack = async (deliveryId) => {
    setTrackingModal({ open: true, data: null, loading: true });
    try {
      const response = await api.get(`/api/delivery/${deliveryId}/track`);
      setTrackingModal({ open: true, data: response.data, loading: false });
    } catch (error) {
      toast.error('Erro ao buscar rastreamento');
      setTrackingModal({ open: false, data: null, loading: false });
    }
  };

  const closeTrackingModal = () => {
    setTrackingModal({ open: false, data: null, loading: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-full">
          <Truck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregadores</h1>
          <p className="text-sm text-gray-500">Gerencie entregas e acompanhe entregadores</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<Package className="w-5 h-5" />}
          title="Entregas Ativas"
          value={activeCount}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatsCard
          icon={<Clock className="w-5 h-5" />}
          title="Entregas Hoje"
          value={todayCount}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          icon={<CheckCircle className="w-5 h-5" />}
          title="Entregas Concluidas"
          value={completedCount}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Active Deliveries Table */}
      <div className="bg-white shadow-card rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Entregas Ativas</h2>
        </div>

        {isLoadingDeliveries ? (
          <div className="flex items-center justify-center py-16">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-lg">Nenhuma entrega ativa</p>
            <p className="text-gray-400 text-sm mt-1">As entregas em andamento aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Pedido #
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Endereço
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status Entrega
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Entregador
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map((delivery) => {
                  const statusInfo = getDeliveryStatus(delivery.deliveryStatus);
                  return (
                    <tr key={delivery.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          #{delivery.orderNumber || delivery.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{delivery.customerName || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {delivery.deliveryAddress || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {delivery.driverName || 'Não atribuído'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrack(delivery.id)}
                        >
                          <MapPin className="w-4 h-4" />
                          Rastrear
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery History */}
      <div className="bg-white shadow-card rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Entregas</h2>
        </div>

        {isLoadingDelivered ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : deliveredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <p className="text-gray-400 text-sm">Nenhuma entrega concluída encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Pedido #
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Endereço
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Entregador
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        #{order.orderNumber || order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{order.customerName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate max-w-[200px]">
                          {order.deliveryAddress || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{order.driverName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="delivered">Entregue</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      <Modal
        isOpen={trackingModal.open}
        onClose={closeTrackingModal}
        title="Rastreamento da Entrega"
      >
        {trackingModal.loading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : trackingModal.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Truck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {trackingModal.data.driverName || 'Entregador'}
                </p>
                <p className="text-xs text-gray-500">
                  {trackingModal.data.driverPhone || 'Telefone indisponível'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Localização Atual</p>
                  <p className="text-sm text-gray-500">
                    {trackingModal.data.currentLocation || 'Localização indisponível'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full mt-0.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Previsão de Entrega</p>
                  <p className="text-sm text-gray-500">
                    {trackingModal.data.estimatedTime || 'Sem previsão'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full mt-0.5">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-gray-500">
                    {getDeliveryStatus(trackingModal.data.status).label}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button variant="ghost" size="sm" onClick={closeTrackingModal}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum dado de rastreamento disponível</p>
        )}
      </Modal>
    </div>
  );
}
