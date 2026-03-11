import {
  UtensilsCrossed,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
} from 'lucide-react';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const LINKS = [
  {
    label: 'Ver Cardapio',
    href: '/',
    icon: UtensilsCrossed,
    color: 'from-amber-500 to-orange-600',
    external: false,
  },
  {
    label: 'Pedir no WhatsApp',
    href: 'https://wa.me/5567996450189?text=Ol%C3%A1!%20Vi%20o%20perfil%20de%20voc%C3%AAs%20e%20quero%20fazer%20um%20pedido!',
    icon: WhatsAppIcon,
    color: 'from-green-500 to-green-600',
    external: true,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/elasespetoemarmitaria/',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    external: true,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61583765741772',
    icon: Facebook,
    color: 'from-blue-500 to-blue-700',
    external: true,
  },
  {
    label: 'Localizacao',
    href: 'https://www.google.com/maps/search/R.+Tito+Mello,+Jardim+Guaicurus,+Dourados+MS',
    icon: MapPin,
    color: 'from-red-500 to-red-600',
    external: true,
  },
];

export default function LinkTree() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-red-500/8 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[-5%] w-[25vw] h-[25vw] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-5 py-10">
        {/* Logo + Name */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-xl scale-110" />
            <img
              src="/logo-elas.png"
              alt="Elas Espeto e Marmitaria"
              className="relative w-28 h-28 rounded-full object-cover border-[3px] border-orange-500/40 shadow-2xl"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h1 className="text-white text-xl font-bold tracking-tight">
              Elas Espeto e Marmitaria
            </h1>
          </div>

          <p className="text-gray-400 text-sm text-center max-w-xs leading-relaxed">
            Espetaria & Marmitaria em Dourados/MS. Comida caseira feita com amor!
          </p>

          {/* Status pill */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <MapPin className="w-3 h-3 text-orange-400" />
              <span className="text-gray-400 text-xs">Dourados, MS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3 text-orange-400" />
              <span className="text-gray-400 text-xs">Seg - Sab</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const Tag = link.external ? 'a' : 'a';
            const props = link.external
              ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: link.href };

            return (
              <Tag
                key={link.label}
                {...props}
                className="group relative flex items-center gap-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                {/* Icon circle with gradient */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <span className="flex-1 text-white font-semibold text-[15px]">
                  {link.label}
                </span>

                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Tag>
            );
          })}
        </div>

        {/* WhatsApp number */}
        <div className="mt-8 text-center">
          <a
            href="tel:+5567996450189"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            (67) 99645-0189
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-600 text-xs">
            R. Tito Mello - Jd. Guaicurus, Dourados/MS
          </p>
          <p className="text-gray-700 text-[10px] mt-2">
            &copy; {new Date().getFullYear()} Elas Espeto e Marmitaria
          </p>
        </footer>
      </div>
    </div>
  );
}
