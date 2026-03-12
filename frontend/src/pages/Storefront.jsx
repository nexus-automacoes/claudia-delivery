import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/useCartStore';
import CartDrawer from '../components/storefront/CartDrawer';
import {
  ChefHat,
  UtensilsCrossed,
  Coffee,
  Pizza,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Search,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Smartphone,
  Star,
  Minus,
  Plus,
} from 'lucide-react';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { addItem, updateQuantity, getItemQuantity, getItemCount, openCart } = useCartStore();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/public/menu`)
      .then((r) => {
        setProducts(r.data.products);
        setCategories(r.data.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter((p) => activeCategory === 'all' || p.category.id === activeCategory)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  // Horario de funcionamento (seg-sab 10h-20h)
  const now = new Date();
  const day = now.getDay(); // 0=dom
  const hour = now.getHours();
  const isOpen = day >= 1 && day <= 6 && hour >= 10 && hour < 20;

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      {/* ============ NAVBAR ============ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900 tracking-tight">
              Claudia
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
              {isOpen ? 'Aberto' : 'Fechado'}
            </div>
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        {/* Floating icons - same style as Login */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[8%] opacity-10">
            <Pizza className="w-20 h-20 text-white animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute top-[20%] right-[10%] opacity-10">
            <Coffee className="w-16 h-16 text-white animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-[15%] left-[12%] opacity-10">
            <UtensilsCrossed className="w-24 h-24 text-white animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-[20%] right-[8%] opacity-10">
            <ChefHat className="w-16 h-16 text-white animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Claudia
              <br />
              Restaurante
            </h1>

            <div className="w-14 h-1 bg-white/40 rounded-full mb-6" />

            <p className="text-white/80 text-lg sm:text-xl max-w-lg mb-8">
              Marmitas caseiras feitas com carinho, entregues quentinhas na sua porta em Dourados
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center gap-3 bg-white text-primary font-bold text-base px-7 py-3.5 rounded-xl transition-all hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <ShoppingCart className="w-5 h-5" />
                Montar Pedido
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-all hover:bg-white/25 border border-white/20"
              >
                Como Funciona
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: Clock, text: 'Entrega 30-45min' },
                { icon: CreditCard, text: 'PIX, Cartao, Dinheiro' },
                { icon: MapPin, text: 'Dourados, MS' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-full text-white/90 text-sm">
                  <Icon className="w-3.5 h-3.5" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom dots - like Login */}
        <div className="relative flex justify-center gap-2 pb-6">
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </section>

      {/* ============ CARDAPIO ============ */}
      <section id="cardapio" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Cardapio de Hoje
          </h2>
          <p className="text-gray-500">Tudo fresquinho, preparado no dia</p>
        </div>

        {/* Search + Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no cardapio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/40'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/40'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid de produtos */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-1">Nenhum produto encontrado</p>
            <p className="text-gray-500 text-sm">
              Tente outro filtro ou fale com a gente no WhatsApp
            </p>
          </div>
        )}
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como-funciona" className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Como Funciona</h2>
            <p className="text-gray-500">Pedir sua marmita e muito simples</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                icon: ShoppingBag,
                title: 'Escolha suas marmitas',
                desc: 'Navegue pelo cardapio e adicione ao carrinho o que mais te agrada',
              },
              {
                step: 2,
                icon: ShoppingCart,
                title: 'Monte seu pedido',
                desc: 'Ajuste quantidades e revise seu pedido no carrinho antes de enviar',
              },
              {
                step: 3,
                icon: Truck,
                title: 'Receba em casa',
                desc: 'Envie pelo WhatsApp e entregamos quentinha em ate 45 minutos',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-gray-50 rounded-2xl p-6 text-center group hover:bg-primary/5 transition-colors"
              >
                <span className="absolute top-4 right-4 text-xs font-bold text-primary/40">
                  0{item.step}
                </span>
                <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA WHATSAPP ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Pronto pra pedir?
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Monte seu pedido no carrinho e envie pelo WhatsApp — simples e rapido!
          </p>
          <a
            href="#cardapio"
            className="inline-flex items-center gap-3 bg-white text-primary font-bold text-base px-8 py-4 rounded-xl transition-all hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Cardapio
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display text-xl font-bold text-white">Claudia</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Marmitas caseiras feitas com carinho para voce e sua familia em Dourados, MS.
              </p>
            </div>

            {/* Horarios */}
            <div>
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
                Horarios
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Segunda a Sabado</span>
                  <span className="text-white">10h - 20h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-red-400">Fechado</span>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
                Contato
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Dourados, MS
                </div>
                <div className="flex items-center gap-2 text-[#25D366]">
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Claudia Restaurante. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* ============ FAB CARRINHO MOBILE ============ */}
      {itemCount > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 sm:hidden"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold text-sm">{itemCount}</span>
        </button>
      )}

      {/* ============ CART DRAWER ============ */}
      <CartDrawer />
    </div>
  );
}

/* ============ PRODUCT CARD ============ */
function ProductCard({ product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const qty = useCartStore((s) => {
    const item = s.items.find((i) => i.product.id === product.id);
    return item ? item.quantity : 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      {/* Imagem */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold text-primary shadow-sm">
          {formatCurrency(product.price)}
        </div>
        {product.category && (
          <div className="absolute top-3 left-3 bg-gray-900/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-white">
            {product.category.icon} {product.category.name}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {qty === 0 ? (
          <button
            onClick={() => addItem(product)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar ao Carrinho
          </button>
        ) : (
          <div className="flex items-center justify-between bg-primary/5 rounded-xl px-3 py-1.5">
            <button
              onClick={() => updateQuantity(product.id, qty - 1)}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-bold text-primary">{qty}</span>
            <button
              onClick={() => updateQuantity(product.id, qty + 1)}
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
