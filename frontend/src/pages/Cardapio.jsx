import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Tag, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import MenuCard from '../components/menu/MenuCard';
import MenuForm from '../components/menu/MenuForm';

// ---------- helpers ----------

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

// ---------- skeleton ----------

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="flex gap-1">
            <div className="h-7 w-7 bg-gray-100 rounded" />
            <div className="h-7 w-7 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Category form modal ----------

function CategoryFormModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nova Categoria">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="cat-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nome da Categoria
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Pizzas"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Criar Categoria</Button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Delete confirmation modal ----------

function DeleteConfirmModal({ product, onClose, onConfirm }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Excluir Produto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir <strong>{product.name}</strong>?
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

// ---------- Main page ----------

export default function Cardapio() {
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // ---------- Queries ----------

  const {
    data: productsRes,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products/products'),
  });

  const {
    data: categoriesRes,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/products/categories'),
  });

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  // ---------- Mutations ----------

  const createProduct = useMutation({
    mutationFn: (data) => api.post('/api/products/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
      setShowProductForm(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar produto');
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/products/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
      setEditingProduct(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar produto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/api/products/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
      setDeletingProduct(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao excluir produto');
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: (id) => api.patch(`/api/products/products/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar disponibilidade');
    },
  });

  const createCategory = useMutation({
    mutationFn: (name) => api.post('/api/products/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada com sucesso!');
      setShowCategoryForm(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar categoria');
    },
  });

  // ---------- Filtering ----------

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' ||
      p.categoryId === activeCategory ||
      p.category?.id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // ---------- Handlers ----------

  const handleProductSubmit = (data) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = (product) => {
    setDeletingProduct(product);
  };

  const handleToggle = (product) => {
    toggleAvailability.mutate(product.id);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id);
    }
  };

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cardapio</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowCategoryForm(true)}>
            <Tag className="w-4 h-4" />
            Nova Categoria
          </Button>
          <Button onClick={() => setShowProductForm(true)}>
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Search + Category tabs */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white"
          />
        </div>

        {/* Category filter tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <MenuCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum produto encontrado</h3>
          <p className="text-sm text-gray-500 mb-4">
            {search
              ? 'Tente uma busca diferente ou limpe o filtro.'
              : 'Comece adicionando seu primeiro produto ao cardapio.'}
          </p>
          {!search && (
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )}
        </div>
      )}

      {/* ----- Modals ----- */}

      {/* Create product */}
      {showProductForm && (
        <MenuForm
          product={null}
          categories={categories}
          onSubmit={handleProductSubmit}
          onClose={() => setShowProductForm(false)}
        />
      )}

      {/* Edit product */}
      {editingProduct && (
        <MenuForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleProductSubmit}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete confirmation */}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Create category */}
      {showCategoryForm && (
        <CategoryFormModal
          onClose={() => setShowCategoryForm(false)}
          onSubmit={(name) => createCategory.mutate(name)}
        />
      )}
    </div>
  );
}
