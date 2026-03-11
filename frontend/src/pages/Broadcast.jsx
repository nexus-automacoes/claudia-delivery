import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Send, MessageCircle, Users, Plus, Trash2, Clock, ImagePlus, X } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export default function Broadcast() {
  const queryClient = useQueryClient();

  // Message form state
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [selectedListId, setSelectedListId] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);

  // Image state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // New list modal state
  const [newListModal, setNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListPhones, setNewListPhones] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);

  // Delete list confirmation
  const [deleteListModal, setDeleteListModal] = useState({ open: false, listId: null, listName: '' });

  // Fetch broadcast lists
  const { data: listsResponse, isLoading: isLoadingLists } = useQuery({
    queryKey: ['broadcastLists'],
    queryFn: () => api.get('/api/broadcast/lists'),
  });

  // Fetch broadcast logs
  const { data: logsResponse, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['broadcastLogs'],
    queryFn: () => api.get('/api/broadcast/logs'),
  });

  // Fetch customers for list creation
  const { data: customersResponse } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers'),
  });

  const broadcastLists = listsResponse?.data || [];
  const broadcastLogs = logsResponse?.data || [];
  const customers = customersResponse?.data || [];

  // Compute contact count for confirmation
  const getContactCount = () => {
    if (targetType === 'all') {
      return customers.length || 'todos os';
    }
    const selectedList = broadcastLists.find((l) => String(l.id) === String(selectedListId));
    return selectedList?.phoneCount || selectedList?.phones?.length || 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no maximo 5MB');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  // Send broadcast mutation
  const sendBroadcastMutation = useMutation({
    mutationFn: (payload) => {
      const formData = new FormData();
      formData.append('message', payload.message);
      if (payload.listId) formData.append('listId', payload.listId);
      if (payload.image) formData.append('image', payload.image);
      return api.post('/api/broadcast/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Broadcast enviado com sucesso!');
      setMessage('');
      removeImage();
      setConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: ['broadcastLogs'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Erro ao enviar broadcast';
      toast.error(msg);
      setConfirmModal(false);
    },
  });

  // Send menu mutation
  const sendMenuMutation = useMutation({
    mutationFn: () => api.post('/api/broadcast/send-menu'),
    onSuccess: () => {
      toast.success('Cardápio do dia enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['broadcastLogs'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Erro ao enviar cardápio';
      toast.error(msg);
    },
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (payload) => api.post('/api/broadcast/lists', payload),
    onSuccess: () => {
      toast.success('Lista criada com sucesso!');
      setNewListModal(false);
      setNewListName('');
      setNewListPhones('');
      setSelectedCustomerIds([]);
      queryClient.invalidateQueries({ queryKey: ['broadcastLists'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Erro ao criar lista';
      toast.error(msg);
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: (listId) => api.delete(`/api/broadcast/lists/${listId}`),
    onSuccess: () => {
      toast.success('Lista excluída com sucesso!');
      setDeleteListModal({ open: false, listId: null, listName: '' });
      queryClient.invalidateQueries({ queryKey: ['broadcastLists'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Erro ao excluir lista';
      toast.error(msg);
    },
  });

  const handleSendBroadcast = () => {
    if (!message.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }
    if (targetType === 'list' && !selectedListId) {
      toast.error('Selecione uma lista');
      return;
    }
    setConfirmModal(true);
  };

  const confirmSendBroadcast = () => {
    const payload = { message };
    if (targetType === 'list') {
      payload.listId = selectedListId;
    }
    if (image) {
      payload.image = image;
    }
    sendBroadcastMutation.mutate(payload);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error('Digite o nome da lista');
      return;
    }

    const phones = newListPhones
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (phones.length === 0 && selectedCustomerIds.length === 0) {
      toast.error('Adicione pelo menos um telefone ou selecione clientes');
      return;
    }

    createListMutation.mutate({
      name: newListName,
      phones,
      customerIds: selectedCustomerIds,
    });
  };

  const handleDeleteList = (listId, listName) => {
    setDeleteListModal({ open: true, listId, listName });
  };

  const confirmDeleteList = () => {
    deleteListMutation.mutate(deleteListModal.listId);
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-3 rounded-full">
          <Send className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast WhatsApp</h1>
          <p className="text-sm text-gray-500">Envie mensagens em massa para seus clientes</p>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SECTION - Enviar Mensagem */}
        <div className="bg-white shadow-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Enviar Mensagem</h2>
          </div>

          {/* Message Textarea */}
          <div className="mb-4">
            <label htmlFor="broadcast-message" className="block text-sm font-semibold text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={5}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length} caracteres</p>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagem (opcional)
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <ImagePlus className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Clique para adicionar imagem</p>
                  <p className="text-xs text-gray-400">JPG, PNG ou WebP - max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Send Menu Quick Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMenuMutation.mutate()}
              disabled={sendMenuMutation.isPending}
            >
              {sendMenuMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Cardápio do Dia
                </>
              )}
            </Button>
          </div>

          {/* Target Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Destinatários</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={() => setTargetType('all')}
                  className="text-primary focus:ring-primary"
                />
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Todos os Clientes</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input
                  type="radio"
                  name="target"
                  value="list"
                  checked={targetType === 'list'}
                  onChange={() => setTargetType('list')}
                  className="text-primary focus:ring-primary"
                />
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Lista Específica</span>
              </label>
            </div>

            {targetType === 'list' && (
              <div className="mt-3">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white"
                >
                  <option value="">Selecione uma lista...</option>
                  {broadcastLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.phoneCount || list.phones?.length || 0} contatos)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSendBroadcast}
            disabled={sendBroadcastMutation.isPending}
          >
            {sendBroadcastMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Broadcast
              </>
            )}
          </Button>
        </div>

        {/* RIGHT SECTION - Listas de Envio */}
        <div className="bg-white shadow-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Listas de Envio</h2>
            </div>
            <Button variant="primary" size="sm" onClick={() => setNewListModal(true)}>
              <Plus className="w-4 h-4" />
              Nova Lista
            </Button>
          </div>

          {isLoadingLists ? (
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
          ) : broadcastLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Nenhuma lista criada</p>
              <p className="text-gray-400 text-sm mt-1">Crie uma lista para enviar mensagens segmentadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcastLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{list.name}</p>
                      <p className="text-xs text-gray-500">
                        {list.phoneCount || list.phones?.length || 0} contatos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id, list.name)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    title="Excluir lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION - Histórico de Envios */}
      <div className="bg-white shadow-card rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Envios</h2>
          </div>
        </div>

        {isLoadingLogs ? (
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
        ) : broadcastLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <p className="text-gray-400 text-sm">Nenhum envio realizado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Data/Hora
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Lista
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Mensagem
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Enviados
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Falhas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {broadcastLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {log.createdAt
                          ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{log.listName || 'Todos'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 truncate block max-w-[250px]" title={log.message}>
                        {log.message?.length > 60
                          ? `${log.message.substring(0, 60)}...`
                          : log.message || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">{log.sentCount ?? 0}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {(log.failedCount ?? 0) > 0 ? (
                        <Badge variant="danger">{log.failedCount}</Badge>
                      ) : (
                        <Badge variant="default">0</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Send Modal */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Confirmar Envio"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Send className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Enviar para <strong>{getContactCount()}</strong> contatos?
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mensagem:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
            {imagePreview && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Imagem:</p>
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setConfirmModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmSendBroadcast}
              disabled={sendBroadcastMutation.isPending}
            >
              {sendBroadcastMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar Envio
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New List Modal */}
      <Modal
        isOpen={newListModal}
        onClose={() => setNewListModal(false)}
        title="Nova Lista de Envio"
        className="max-w-xl"
      >
        <div className="space-y-4">
          {/* List Name */}
          <div>
            <label htmlFor="list-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Lista
            </label>
            <input
              id="list-name"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Clientes VIP"
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Phone Numbers */}
          <div>
            <label htmlFor="list-phones" className="block text-sm font-semibold text-gray-700 mb-2">
              Números de Telefone (um por linha)
            </label>
            <textarea
              id="list-phones"
              value={newListPhones}
              onChange={(e) => setNewListPhones(e.target.value)}
              placeholder={"5511999999999\n5511988888888\n5511977777777"}
              rows={4}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none font-mono text-sm"
            />
          </div>

          {/* Select Customers */}
          {customers.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ou selecione clientes existentes
              </label>
              <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto">
                {customers.map((customer) => (
                  <label
                    key={customer.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 block truncate">{customer.name}</span>
                      <span className="text-xs text-gray-400">{customer.phone}</span>
                    </div>
                  </label>
                ))}
              </div>
              {selectedCustomerIds.length > 0 && (
                <p className="text-xs text-primary mt-1">
                  {selectedCustomerIds.length} cliente(s) selecionado(s)
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setNewListModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateList}
              disabled={createListMutation.isPending}
            >
              {createListMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar Lista'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete List Confirmation Modal */}
      <Modal
        isOpen={deleteListModal.open}
        onClose={() => setDeleteListModal({ open: false, listId: null, listName: '' })}
        title="Excluir Lista"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir a lista <strong>{deleteListModal.listName}</strong>? Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteListModal({ open: false, listId: null, listName: '' })}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteList}
              disabled={deleteListMutation.isPending}
            >
              {deleteListMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir Lista
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
