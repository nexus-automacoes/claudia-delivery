import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Upload,
  Eye,
  Pencil,
  Trash2,
  MessageCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

// ---------- helpers ----------

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function whatsappLink(phone) {
  const digits = phone?.replace(/\D/g, '') || '';
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${number}`;
}

// ---------- Row skeleton ----------

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    </tr>
  );
}

// ---------- Customer form modal ----------

function CustomerFormModal({ customer, onClose, onSubmit }) {
  const isEdit = Boolean(customer);

  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    neighborhood: customer?.neighborhood || '',
    city: customer?.city || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="cust-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nome
          </label>
          <input
            id="cust-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Nome do cliente"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="cust-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Telefone
          </label>
          <input
            id="cust-phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="(99) 99999-9999"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
          <p className="text-xs text-gray-400 mt-1">Formato: (DD) XXXXX-XXXX</p>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="cust-address" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Endereco
          </label>
          <input
            id="cust-address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Rua, numero, complemento"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Neighborhood + City row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cust-neighborhood" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bairro
            </label>
            <input
              id="cust-neighborhood"
              name="neighborhood"
              type="text"
              value={form.neighborhood}
              onChange={handleChange}
              placeholder="Bairro"
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="cust-city" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cidade
            </label>
            <input
              id="cust-city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="Cidade"
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? 'Salvar Alteracoes' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Import modal ----------

function ImportModal({ onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState([]);

  const handleParse = () => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const customers = lines
      .map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        if (parts.length >= 2) {
          return { name: parts[0], phone: parts[1] };
        }
        return null;
      })
      .filter(Boolean);

    setParsed(customers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsed.length === 0) {
      toast.error('Nenhum cliente valido encontrado');
      return;
    }
    onSubmit(parsed);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Importar Clientes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Lista de Clientes
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParsed([]);
            }}
            rows={8}
            placeholder={"Nome, Telefone\nMaria Silva, 11999998888\nJoao Santos, 21988887777"}
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Um cliente por linha no formato: nome, telefone
          </p>
        </div>

        {parsed.length === 0 && text.trim() && (
          <Button type="button" variant="secondary" onClick={handleParse} className="w-full">
            Validar Lista ({text.split('\n').filter((l) => l.trim()).length} linhas)
          </Button>
        )}

        {parsed.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
              {parsed.length} {parsed.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
              {parsed.map((c, i) => (
                <div key={i} className="px-4 py-2 text-sm flex items-center justify-between">
                  <span className="text-gray-800">{c.name}</span>
                  <span className="text-gray-500 font-mono text-xs">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={parsed.length === 0}>
            Importar {parsed.length > 0 && `(${parsed.length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Delete confirmation ----------

function DeleteConfirmModal({ customer, onClose, onConfirm }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Excluir Cliente">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir <strong>{customer.name}</strong>?
          Esta acao nao pode ser desfeita.
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Customer detail / order history side panel ----------

function CustomerDetailPanel({ customer, onClose }) {
  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['customer-orders', customer.id],
    queryFn: () => api.get(`/api/customers/${customer.id}/orders`),
    enabled: Boolean(customer.id),
  });

  const orders = ordersRes?.data || [];

  const STATUS_LABELS = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    DISPATCHED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  };

  const STATUS_VARIANT = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DISPATCHED: 'dispatched',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500">{formatPhone(customer.phone)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer info */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-2">
          {customer.address && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Endereco:</span> {customer.address}
            </p>
          )}
          {customer.neighborhood && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Bairro:</span> {customer.neighborhood}
            </p>
          )}
          {customer.city && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Cidade:</span> {customer.city}
            </p>
          )}
        </div>

        {/* Orders */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Historico de Pedidos
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      #{String(order.number || order.id).padStart(3, '0')}
                    </span>
                    <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('pt-BR')
                        : ''}
                    </span>
                    <span className="text-sm font-semibold font-mono text-gray-800">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main page ----------

const PAGE_SIZE = 15;

export default function Clientes() {
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ---------- Query ----------

  const { data: customersRes, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers'),
  });

  const allCustomers = customersRes?.data || [];

  // ---------- Mutations ----------

  const createCustomer = useMutation({
    mutationFn: (data) => api.post('/api/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente criado com sucesso!');
      setShowForm(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar cliente');
    },
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente atualizado com sucesso!');
      setEditingCustomer(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar cliente');
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: (id) => api.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente excluído com sucesso!');
      setDeletingCustomer(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao excluir cliente');
    },
  });

  const importCustomers = useMutation({
    mutationFn: (customers) => api.post('/api/customers/import', { customers }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      const count = res.data?.imported ?? res.data?.length ?? 0;
      toast.success(`${count} clientes importados com sucesso!`);
      setShowImport(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao importar clientes');
    },
  });

  // ---------- Filtering + pagination ----------

  const filtered = allCustomers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ---------- Handlers ----------

  const handleCustomerSubmit = (data) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomer.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCustomer) {
      deleteCustomer.mutate(deletingCustomer.id);
    }
  };

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {allCustomers.length} {allCustomers.length === 1 ? 'cliente' : 'clientes'} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome ou telefone..."
          className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap">Nome</th>
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap">Telefone</th>
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap">Bairro</th>
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap">Cidade</th>
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">Pedidos</th>
                <th className="px-6 py-3 font-semibold text-gray-600 whitespace-nowrap text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
              ) : paginated.length > 0 ? (
                paginated.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap font-mono text-xs">
                      {formatPhone(customer.phone)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {customer.neighborhood || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {customer.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={customer._count?.orders > 0 || customer.ordersCount > 0 ? 'success' : 'default'}>
                        {customer._count?.orders ?? customer.ordersCount ?? 0}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Ver pedidos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCustomer(customer);
                          }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <a
                          href={whatsappLink(customer.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingCustomer(customer);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Nenhum cliente encontrado</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {search
                        ? 'Tente uma busca diferente.'
                        : 'Comece adicionando seu primeiro cliente.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}
              {' - '}
              {Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                        item === safePage
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----- Modals ----- */}

      {/* Create customer */}
      {showForm && (
        <CustomerFormModal
          customer={null}
          onClose={() => setShowForm(false)}
          onSubmit={handleCustomerSubmit}
        />
      )}

      {/* Edit customer */}
      {editingCustomer && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSubmit={handleCustomerSubmit}
        />
      )}

      {/* Delete confirmation */}
      {deletingCustomer && (
        <DeleteConfirmModal
          customer={deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSubmit={(customers) => importCustomers.mutate(customers)}
        />
      )}

      {/* Customer detail side panel */}
      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
