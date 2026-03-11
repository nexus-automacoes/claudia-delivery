import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Users, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOrderStats } from '../hooks/useOrders';
import StatsCard from '../components/ui/StatsCard';
import Badge from '../components/ui/Badge';
import api from '../services/api';

const weeklyChartData = [
  { day: 'Seg', vendas: 1200 },
  { day: 'Ter', vendas: 1850 },
  { day: 'Qua', vendas: 980 },
  { day: 'Qui', vendas: 2100 },
  { day: 'Sex', vendas: 2800 },
  { day: 'Sab', vendas: 3200 },
  { day: 'Dom', vendas: 2400 },
];

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  dispatched: 'Saiu p/ entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

function formatCurrency(value) {
  if (value == null) return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded mt-3" />
          <div className="h-3 w-20 bg-gray-100 rounded mt-3" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 animate-pulse lg:col-span-2">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
      <div className="h-64 bg-gray-100 rounded-lg" />
    </div>
  );
}

function SkeletonOrders() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 animate-pulse">
      <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-100 rounded mt-2" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-card rounded-lg px-4 py-3 border border-gray-100">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-primary font-bold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data } = await api.get('/api/orders?limit=5');
        setRecentOrders(Array.isArray(data) ? data : data.orders || []);
      } catch {
        setRecentOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Vis&atilde;o geral do seu neg&oacute;cio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatsCard
              title="Pedidos Hoje"
              value={stats?.ordersToday ?? 0}
              icon={<ShoppingBag className="w-6 h-6" />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Faturamento"
              value={formatCurrency(stats?.revenueToday)}
              icon={<DollarSign className="w-6 h-6" />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Total Clientes"
              value={stats?.totalCustomers ?? 0}
              icon={<Users className="w-6 h-6" />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Pedidos Pendentes"
              value={stats?.pendingOrders ?? 0}
              icon={<Clock className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </>
        )}
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart */}
        {statsLoading ? (
          <SkeletonChart />
        ) : (
          <div className="bg-white rounded-xl shadow-card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Vendas da Semana</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 13 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 13 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="#FF6B35"
                    strokeWidth={2.5}
                    fill="url(#colorVendas)"
                    dot={{ r: 4, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {ordersLoading ? (
          <SkeletonOrders />
        ) : (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Pedidos Recentes</h2>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          #{order.orderNumber || order.number || '---'}
                        </span>
                        <Badge variant={order.status || 'default'}>
                          {statusLabels[order.status] || order.status || 'N/A'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {order.customer?.name || order.customerName || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.createdAt
                          ? formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : '---'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
