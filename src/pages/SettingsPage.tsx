import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Save, User, Smartphone, Tag } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';

export const SettingsPage = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        referralCode: '',
        phoneNumber: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch current profile data
    useEffect(() => {
        // We can use the user object from context if it has the info, 
        // or fetch from an endpoint. Since we just added fields, user context might be stale or incomplete.
        // Ideally we should have a /auth/me endpoint, but for now let's rely on what we can get or maybe fetch if needed.
        // Actually, let's fetch the profile or just use what we have if we update the context.
        // For now, let's assume we might need to fetch it. But we don't have a specific "get my profile" endpoint unless we use the list one filtering...
        // Wait, I implemented PATCH /admins/profile but not GET /admins/profile explicitly. 
        // However, the AuthContext usually decodes the token. The token won't have the new fields unless we refresh it.
        // Let's add a GET /admins/profile endpoint in the backend? Or just use what we have?
        // Ah, I missed adding a GET endpoint for the profile in the plan.
        // I can just use GET /admins (list) and find stats, but that's inefficient.
        // Let's quickly add GET /admins/profile to the backend in the next step or now.
        // For now, let's assume I will add it or I'll just rely on the user inputting data.
        // Actually, it's better to show existing data.
        // I'll add GET /admins/profile to the backend quickly as well.
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
                referralCode: formData.referralCode,
                phoneNumber: formData.phoneNumber
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
                                value={user?.username || ''}
                                className="bg-slate-100 text-slate-500"
                             />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Code Parrain
                                </label>
                                <Input 
                                    name="referralCode"
                                    placeholder="Ex: PROMO2024"
                                    value={formData.referralCode}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-slate-400">Ce code sera utilisé pour vos liens de parrainage (optionnel).</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Numéro de Téléphone
                                </label>
                                <Input 
                                    name="phoneNumber"
                                    placeholder="+33 6 12 34 56 78"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
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
