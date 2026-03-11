import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../services/api';

export default function useAuth() {
  const navigate = useNavigate();
  const { user, token, setAuth, logout: storeLogout } = useStore();

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setAuth(data.user, data.token);
    navigate('/admin');
    return data;
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  return { user, token, isAuthenticated: !!token, login, logout };
}
