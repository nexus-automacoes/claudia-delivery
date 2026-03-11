import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'CREDIT_CARD', label: 'Cartao Credito' },
  { value: 'DEBIT_CARD', label: 'Cartao Debito' },
];

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export default function OrderModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers').then((r) => r.data),
    enabled: isOpen,
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then((r) => r.data),
    enabled: isOpen,
  });

  const customers = useMemo(() => {
    const list = Array.isArray(customersData) ? customersData : customersData?.data || [];
    if (!customerSearch.trim()) return list;
    return list.filter((c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customersData, customerSearch]);

  const products = useMemo(() => {
    const list = Array.isArray(productsData) ? productsData : productsData?.data || [];
    if (!productSearch.trim()) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productsData, productSearch]);

  // Auto-fill address from customer
  useEffect(() => {
    if (selectedCustomer?.address) {
      setDeliveryAddress(selectedCustomer.address);
    }
  }, [selectedCustomer]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomerSearch('');
      setSelectedCustomer(null);
      setShowCustomerDropdown(false);
      setItems([]);
      setProductSearch('');
      setShowProductDropdown(false);
      setDeliveryAddress('');
      setDeliveryFee('');
      setPaymentMethod('');
      setNotes('');
    }
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (parseFloat(deliveryFee) || 0);

  function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  }

  function handleAddProduct(product) {
    const existing = items.find((i) => i.productId === (product.id || product._id));
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === (product.id || product._id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id || product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          notes: '',
        },
      ]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  }

  function handleItemQuantity(index, quantity) {
    if (quantity < 1) return;
    setItems(items.map((item, i) => (i === index ? { ...item, quantity } : item)));
  }

  function handleItemNotes(index, notes) {
    setItems(items.map((item, i) => (i === index ? { ...item, notes } : item)));
  }

  function handleRemoveItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCustomer || items.length === 0 || !paymentMethod) return;

    onSubmit?.({
      customerId: selectedCustomer.id || selectedCustomer._id,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      })),
      deliveryAddress,
      deliveryFee: parseFloat(deliveryFee) || 0,
      paymentMethod,
      notes,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Pedido" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Customer selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
                if (!e.target.value) setSelectedCustomer(null);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
            />
          </div>
          {showCustomerDropdown && customers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.id || customer._id}
                  type="button"
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="font-medium text-gray-800">{customer.name}</span>
                  {customer.phone && (
                    <span className="text-gray-400 ml-2 text-xs">{customer.phone}</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedCustomer && (
            <p className="mt-1 text-xs text-green-600">
              Selecionado: {selectedCustomer.name}
            </p>
          )}
        </div>

        {/* Product search and items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Itens do Pedido</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Buscar produto para adicionar..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
            />
          </div>
          {showProductDropdown && products.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id || product._id}
                  type="button"
                  onClick={() => handleAddProduct(product)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors duration-150 flex items-center justify-between first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="font-medium text-gray-800">{product.name}</span>
                  <span className="text-gray-500 text-xs">{formatCurrency(product.price)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Items list */}
          {items.length > 0 && (
            <div className="mt-3 space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 ml-2 whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleItemQuantity(index, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-xs transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleItemQuantity(index, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-xs transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemNotes(index, e.target.value)}
                        placeholder="Obs..."
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-150 mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereco de Entrega
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Rua, numero, bairro..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
          />
        </div>

        {/* Delivery fee + Payment method row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Entrega
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 bg-white"
            >
              <option value="">Selecione...</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observacoes do pedido..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 resize-none"
          />
        </div>

        {/* Running total */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxa de entrega</span>
            <span>{formatCurrency(parseFloat(deliveryFee) || 0)}</span>
          </div>
          <div className="border-t border-gray-200 pt-1.5 flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!selectedCustomer || items.length === 0 || !paymentMethod || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Criar Pedido
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
