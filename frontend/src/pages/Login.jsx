import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ChefHat, UtensilsCrossed, Coffee, Pizza } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useStore from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const token = useStore((state) => state.token);

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        {/* Decorative floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[15%] opacity-10">
            <Pizza className="w-24 h-24 text-white animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute top-[30%] right-[10%] opacity-10">
            <Coffee className="w-20 h-20 text-white animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-[25%] left-[10%] opacity-10">
            <UtensilsCrossed className="w-28 h-28 text-white animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-[10%] right-[20%] opacity-10">
            <ChefHat className="w-20 h-20 text-white animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <div className="flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl mb-8 shadow-lg">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold text-white text-center leading-tight">
            Claudia
            <br />
            Delivery
          </h1>
          <div className="w-16 h-1 bg-white/40 rounded-full mt-6 mb-6" />
          <p className="text-white/80 text-lg text-center max-w-xs">
            Sistema de Gest&atilde;o de Pedidos
          </p>

          {/* Bottom decoration */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Claudia Delivery</h1>
            <p className="text-gray-500 mt-1">Sistema de Gest&atilde;o de Pedidos</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-card p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500 mt-2">Fa&ccedil;a login para acessar o painel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} Claudia Delivery. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
