import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function MenuForm({ product, categories = [], onSubmit, onClose }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        categoryId: product.categoryId || product.category?.id || '',
        available: product.available !== false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      categoryId: form.categoryId || null,
      available: form.available,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Editar Produto' : 'Novo Produto'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="product-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nome do Produto
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ex: Pizza Margherita"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="product-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Descricao
          </label>
          <textarea
            id="product-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Descreva o produto..."
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="product-price" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Preco (R$)
          </label>
          <input
            id="product-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            placeholder="0,00"
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 font-mono"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="product-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Categoria
          </label>
          <select
            id="product-category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image upload placeholder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Imagem
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary/40 hover:text-primary/60 transition-colors duration-200 cursor-pointer">
            <Upload className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">Clique ou arraste uma imagem</p>
            <p className="text-xs mt-1">PNG, JPG ate 2MB (em breve)</p>
          </div>
        </div>

        {/* Available toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, available: !prev.available }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              form.available ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                form.available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <label className="text-sm font-medium text-gray-700">
            {form.available ? 'Disponível' : 'Indisponível'}
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
