import { ChevronRight, ChevronLeft } from 'lucide-react';
import OrderCard from './OrderCard';

const COLUMNS = [
  { status: 'PENDING', label: 'Novos', color: 'bg-yellow-400', textColor: 'text-yellow-700', bgCount: 'bg-yellow-100' },
  { status: 'CONFIRMED', label: 'Confirmados', color: 'bg-blue-400', textColor: 'text-blue-700', bgCount: 'bg-blue-100' },
  { status: 'PREPARING', label: 'Preparando', color: 'bg-purple-400', textColor: 'text-purple-700', bgCount: 'bg-purple-100' },
  { status: 'READY', label: 'Prontos', color: 'bg-green-400', textColor: 'text-green-700', bgCount: 'bg-green-100' },
  { status: 'DISPATCHED', label: 'Em Entrega', color: 'bg-orange-400', textColor: 'text-orange-700', bgCount: 'bg-orange-100' },
  { status: 'DELIVERED', label: 'Entregues', color: 'bg-emerald-400', textColor: 'text-emerald-700', bgCount: 'bg-emerald-100' },
];

const STATUS_FLOW = COLUMNS.map((c) => c.status);

function getNextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

function getPrevStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx <= 0) return null;
  return STATUS_FLOW[idx - 1];
}

export default function OrderKanban({ orders = [], onStatusChange, onOrderClick }) {
  const ordersByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.status] = orders.filter((o) => o.status === col.status);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory lg:snap-none">
      {COLUMNS.map((col) => {
        const columnOrders = ordersByStatus[col.status] || [];
        return (
          <div
            key={col.status}
            className="bg-gray-50/80 rounded-xl min-w-[280px] w-[280px] flex-shrink-0 p-3 snap-center"
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-sm text-gray-700">{col.label}</h3>
              </div>
              <span
                className={`${col.bgCount} ${col.textColor} text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center`}
              >
                {columnOrders.length}
              </span>
            </div>

            {/* Cards list */}
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin">
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Nenhum pedido
                </div>
              )}
              {columnOrders.map((order) => (
                <div key={order.id || order._id}>
                  <OrderCard order={order} onClick={onOrderClick} />

                  {/* Status change buttons */}
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    {getPrevStatus(order.status) ? (
                      <button
                        onClick={() =>
                          onStatusChange?.(order.id || order._id, getPrevStatus(order.status))
                        }
                        className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors duration-150"
                        title={`Mover para ${COLUMNS.find((c) => c.status === getPrevStatus(order.status))?.label}`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    {getNextStatus(order.status) ? (
                      <button
                        onClick={() =>
                          onStatusChange?.(order.id || order._id, getNextStatus(order.status))
                        }
                        className="flex items-center gap-0.5 text-[11px] text-primary hover:text-primary-dark font-medium transition-colors duration-150"
                        title={`Mover para ${COLUMNS.find((c) => c.status === getNextStatus(order.status))?.label}`}
                      >
                        <span>Avancar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
