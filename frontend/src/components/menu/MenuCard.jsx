import { UtensilsCrossed, Pencil, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export default function MenuCard({ product, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-10 h-10 text-gray-300" />
        )}

        {/* Availability toggle overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(product);
          }}
          className="absolute top-3 right-3"
          title={product.available ? 'Disponível' : 'Indisponível'}
        >
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              product.available ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                product.available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        </div>

        {product.category?.name && (
          <div className="mb-2">
            <Badge>{product.category.name}</Badge>
          </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}

        {!product.description && <div className="flex-1" />}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="text-lg font-bold font-mono text-gray-900">
            {formatCurrency(product.price)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
