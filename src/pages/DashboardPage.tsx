import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { Copy, Users, UserCheck, TrendingUp, Search, Filter, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Prospect {
  _id: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  email: string;
  ebookId: string;
  sbcStatus: string;
  createdAt: string;
}

interface Ebook {
    _id: string;
    title: string;
    coverUrl: string;
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Assuming prospects-ui runs on port 5173
  const referralLink = `https://sniperbusinessebook.online/?ref=${user?.adminId}`;

  // Polling interval: 5 minutes
  const POLLING_INTERVAL_MS = 5 * 60 * 1000;

  const fetchData = useCallback(async (showSyncIndicator = false) => {
    if (showSyncIndicator) setIsSyncing(true);
    try {
      const [prospectsRes, statsRes, ebooksRes] = await Promise.all([
        api.get('/prospects'),
        api.get('/prospects/stats'),
        api.get('/ebooks')
      ]);
      const sortedProspects = prospectsRes.data.sort((a: Prospect, b: Prospect) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProspects(sortedProspects);
      setEbooks(ebooksRes.data);
      setStats(statsRes.data);
      setLastSynced(new Date());

      // Process chart data
      const isoGroups: Record<string, { date: string; fullDate: string; prospects: number; registered: number }> = {};
      
      prospectsRes.data.forEach((p: Prospect) => {
        const isoDate = new Date(p.createdAt).toISOString().split('T')[0];
        if (!isoGroups[isoDate]) {
            isoGroups[isoDate] = { 
                date: new Date(p.createdAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }), 
                fullDate: isoDate,
                prospects: 0, 
                registered: 0 
            };
        }
        isoGroups[isoDate].prospects += 1;
        if (['INSCRIT', 'ABONNE'].includes(p.sbcStatus)) {
            isoGroups[isoDate].registered += 1;
        }
      });

      const processedChartData = Object.values(isoGroups)
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
        
      setChartData(processedChartData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showSyncIndicator) setIsSyncing(false);
    }
  }, []);

  // Setup polling with visibility API
  useEffect(() => {
    fetchData();

    const startPolling = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, POLLING_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchData(true); // Refresh immediately when tab becomes visible
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, POLLING_INTERVAL_MS]);

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    return `il y a ${Math.floor(diffMins / 60)} h`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);

    alert("Lien copié dans le presse-papiers !");
  };

  const copyEbookLink = (ebookId: string) => {
    const link = `https://sniperbusinessebook.online/capture/${ebookId}?ref=${user?.referralCode || user?.adminId}`; // Use referralCode if available, fallback to ID
    navigator.clipboard.writeText(link);
    alert("Lien Ebook copié !");
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        
        {/* Hero Section / Referral Link */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-8 text-white shadow-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Bon retour, {user?.role}</h1>
                <p className="text-blue-100 mb-6 md:mb-8 max-w-xl text-sm md:text-base">Suivez vos progrès et gérez vos prospects efficacement. Partagez votre lien de parrainage pour développer votre réseau.</p>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl inline-flex flex-col md:flex-row items-center gap-2 max-w-3xl w-full">
                    <div className="bg-black/20 px-4 py-2 rounded-lg flex-1 w-full md:w-auto overflow-hidden">
                        <code className="text-sm font-mono text-blue-50 truncate block">{referralLink}</code>
                    </div>
                    <Button onClick={copyLink} className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 border-none shrink-0">
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le lien
                    </Button>
                </div>
            </div>
        </motion.div>

        {/* Ebook Links Grid */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Vos Liens de Parrainage Ebooks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ebooks.map((ebook, index) => (
                    <motion.div 
                        key={ebook._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-slate-200">
                             <div className="w-16 h-20 bg-slate-100 rounded-md shrink-0 overflow-hidden">
                                {ebook.coverUrl ? (
                                    <img src={ebook.coverUrl} alt={ebook.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Cover</div>
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 truncate" title={ebook.title}>{ebook.title}</h3>
                                <p className="text-xs text-slate-500 mb-2 truncate">
                                    ID: {ebook._id}
                                </p>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full text-xs"
                                    onClick={() => copyEbookLink(ebook._id)}
                                >
                                    <Copy className="w-3 h-3 mr-2" />
                                    Copier le lien
                                </Button>
                             </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Synchronisation...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Dernière synchro : {formatTimeAgo(lastSynced)}</span>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
                title="Total des Prospects" 
                value={stats?.total || 0} 
                icon={Users} 
                color="blue" 
                delay={0.1} 
            />
            <StatCard 
                title="Membres Vérifiés" 
                value={stats?.verifiedMembers || 0} 
                icon={CheckCircle} 
                color="emerald" 
                delay={0.15} 
            />
            <StatCard 
                title="Taux de Conversion" 
                value={`${stats?.verifiedConversionRate || stats?.conversionRate || 0}%`} 
                icon={TrendingUp} 
                color="green" 
                delay={0.2} 
            />
            <StatCard 
                title="Abonnés" 
                value={stats?.subscribers || 0} 
                icon={UserCheck} 
                color="purple" 
                delay={0.3} 
            />
        </div>

        {/* Growth Chart */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Aperçu de la Croissance</h2>
                    <p className="text-sm text-slate-500">Comparaison des prospects et des inscrits dans le temps</p>
                </div>
                <div className="w-full" style={{ height: 300, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748B', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748B', fontSize: 12 }} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line 
                                type="monotone" 
                                dataKey="prospects" 
                                stroke="#2563eb" 
                                strokeWidth={3}
                                name="Prospects"
                                activeDot={{ r: 8 }}
                                dot={{ fill: '#2563eb', r: 4 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="registered" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                name="Inscrits"
                                activeDot={{ r: 8 }}
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </motion.div>

        {/* Prospects Table Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Prospects Récents</h2>
                        <p className="text-sm text-slate-500">Gérez et suivez vos derniers prospects</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher des prospects..." 
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="shrink-0 flex-1 sm:flex-none">
                                <Filter className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button variant="outline" size="icon" className="shrink-0 flex-1 sm:flex-none">
                                <Download className="w-4 h-4 text-slate-600" />
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto bg-white">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">NOM</th>
                                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">CONTACT</th>
                                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">ID EBOOK</th>
                                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUT</th>
                                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">DATE D'INSCRIPTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {prospects.slice(0, 5).map((prospect, index) => (
                                <motion.tr 
                                    key={prospect._id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="py-3 px-4 md:py-4 md:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs shrink-0">
                                                {prospect.firstName[0]}{prospect.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 text-sm">{prospect.firstName} {prospect.lastName}</div>
                                                {/* Mobile only contact info */}
                                                <div className="text-xs text-slate-500 sm:hidden">{prospect.whatsapp}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 md:py-4 md:px-6 hidden sm:table-cell">
                                        <div className="text-sm text-slate-600">{prospect.email}</div>
                                        <div className="text-xs text-slate-400">{prospect.whatsapp}</div>
                                    </td>
                                    <td className="py-3 px-4 md:py-4 md:px-6 text-sm text-slate-500 font-mono hidden md:table-cell">
                                        {prospect.ebookId}
                                    </td>
                                    <td className="py-3 px-4 md:py-4 md:px-6">
                                        <StatusBadge status={prospect.sbcStatus} />
                                    </td>
                                    <td className="py-3 px-4 md:py-4 md:px-6 text-sm text-slate-500 hidden lg:table-cell">
                                        {new Date(prospect.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                </motion.tr>
                            ))}
                            {prospects.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Users className="w-12 h-12 mb-3 bg-slate-50 rounded-full p-2" />
                                            <p className="text-base font-medium text-slate-600">Aucun prospect trouvé</p>
                                            <p className="text-sm mt-1">Partagez votre lien de parrainage pour commencer !</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>

      </div>
    </AdminLayout>
  );
};

// Sub-components
const StatCard = ({ title, value, icon: Icon, color, delay }: any) => {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        emerald: "bg-emerald-100 text-emerald-700",
        purple: "bg-violet-50 text-violet-600",
    }[color as string] || "bg-slate-50 text-slate-600";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="hover:shadow-md transition-shadow duration-300 border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", colorStyles)}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        'ABONNE': "bg-emerald-100 text-emerald-700 border-emerald-200",
        'INSCRIT': "bg-blue-100 text-blue-700 border-blue-200",
        'DEFAULT': "bg-slate-100 text-slate-700 border-slate-200"
    };
    
    const style = styles[status as keyof typeof styles] || styles.DEFAULT;
    const label = status === 'ABONNE' ? 'Abonné' : status === 'INSCRIT' ? 'Inscrit' : status;

    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", style)}>
            {label}
        </span>
    );
};
