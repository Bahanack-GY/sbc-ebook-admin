import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Lock, User, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import logoSbc from '../assets/logo-sbc.png';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.access_token, res.data.adminId, res.data.role, res.data.referralCode);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.message === 'Account suspended') {
          setShowSuspendedModal(true);
      } else {
          setError('Identifiants invalides');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <img src={logoSbc} alt="SBC Logo" className="h-24 w-auto drop-shadow-lg" />
        </div>
        
        <Card className="w-full shadow-xl border-t-4 border-t-blue-600">
            <div className="text-center mb-8 pt-4">
                <h1 className="text-2xl font-bold text-slate-800">Connexion</h1>
                <p className="text-slate-500 mt-2">Accédez à votre espace administrateur</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center justify-center">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nom d'utilisateur</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Votre nom d'utilisateur" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Votre mot de passe" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-slate-600">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                    Mot de passe oublié ?
                </a>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" 
                isLoading={isLoading}
            >
                Se connecter
            </Button>
            </form>
            
            <div className="mt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Sniper Business Center. Tous droits réservés.
            </div>
        </Card>
      </div>
    
    {showSuspendedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TriangleAlert className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Compte Suspendu</h2>
                <p className="text-slate-600 mb-6">
                    Votre compte administrateur a été suspendu par un super administrateur. 
                    Vous ne pouvez plus accéder au tableau de bord.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 text-sm text-slate-500">
                    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur principal.
                </div>
                <Button 
                    onClick={() => setShowSuspendedModal(false)}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                >
                    Compris
                </Button>
            </div>
        </div>
    )}
    </div>
  );
};
