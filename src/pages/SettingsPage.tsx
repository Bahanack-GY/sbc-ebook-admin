import { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Save, User, Smartphone, Tag } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';

export const SettingsPage = () => {
//     const { user } = useAuth();
    const [formData, setFormData] = useState({
        salesPageLink: '',
        whatsappGroupLink: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch current profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/admins/profile');
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        salesPageLink: data.salesPageLink || '',
                        whatsappGroupLink: data.whatsappGroupLink || '',
                        username: data.username || prev.username
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.patch('/admins/profile', {
                salesPageLink: formData.salesPageLink,
                whatsappGroupLink: formData.whatsappGroupLink
            });
            
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            // Optionally update context if we store these there
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Paramètres du Compte</h1>
                    <p className="text-slate-500">Gérez vos informations personnelles et préférences.</p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nom d'utilisateur (Lecture seule)
                             </label>
                             <Input 
                                disabled
                                value={formData.username}
                                className="bg-slate-100 text-slate-500"
                             />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Lien de votre page de vente
                                </label>
                                <Input 
                                    name="salesPageLink"
                                    placeholder="https://sniperbuisnesscenter.com/connexion"
                                    value={formData.salesPageLink}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-slate-400">Ce lien sera utilisé pour le bouton "Je veux comprendre la SBC maintenant".</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Lien de votre groupe WhatsApp
                                </label>
                                <Input 
                                    name="whatsappGroupLink"
                                    placeholder="https://chat.whatsapp.com/..."
                                    value={formData.whatsappGroupLink}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-slate-400">Ce lien sera utilisé pour le bouton "Je rejoins le groupe WhatsApp SBC".</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
};
