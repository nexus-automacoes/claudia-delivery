import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import Badge from '../ui/Badge';

const STATUS_BORDER_COLORS = {
  PENDING: 'border-l-yellow-400',
  CONFIRMED: 'border-l-blue-400',
  PREPARING: 'border-l-purple-400',
  READY: 'border-l-green-400',
  DISPATCHED: 'border-l-orange-400',
  DELIVERED: 'border-l-emerald-400',
};

const PAYMENT_LABELS = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartao Credito',
  DEBIT_CARD: 'Cartao Debito',
};

const PAYMENT_BADGE_VARIANT = {
  PIX: 'confirmed',
  CASH: 'ready',
  CREDIT_CARD: 'preparing',
  DEBIT_CARD: 'preparing',
};

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function getItemsSummary(items) {
  if (!items || items.length === 0) return '';
  const first = items.slice(0, 2).map((item) => `${item.quantity}x ${item.product?.name || item.name}`);
  const remaining = items.length - 2;
  if (remaining > 0) {
    return `${first.join(', ')} e mais ${remaining}`;
  }
  return first.join(', ');
}

export default function OrderCard({ order, onClick }) {
  const borderColor = STATUS_BORDER_COLORS[order.status] || 'border-l-gray-300';
  const timeAgo = order.createdAt
    ? formatDistanceToNow(new Date(order.createdAt), { locale: ptBR, addSuffix: true })
    : '';

  return (
    <div
      onClick={() => onClick?.(order)}
      className={`bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border-l-4 ${borderColor}`}
    >
      {/* Header: order number + time */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-bold text-gray-900">
          #{String(order.number || order.id).padStart(3, '0')}
        </span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>

      {/* Customer name */}
      <p className="text-sm font-medium text-gray-800 truncate mb-1">
        {order.customer?.name || 'Cliente'}
      </p>

      {/* Items summary */}
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">
        {getItemsSummary(order.items)}
      </p>

      {/* Footer: total + payment */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(order.total)}
        </span>
        {order.paymentMethod && (
          <Badge variant={PAYMENT_BADGE_VARIANT[order.paymentMethod] || 'default'}>
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </Badge>
        )}
      </div>
    </div>
  );
}
