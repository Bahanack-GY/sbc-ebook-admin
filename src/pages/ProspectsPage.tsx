import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { Search, Filter, Download, Users, ChevronDown, Loader2, CheckCircle, XCircle, Clock, RefreshCw, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AdminLayout } from '../components/layout/AdminLayout';
import { motion } from 'framer-motion';

interface Prospect {
  _id: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  email: string;
  ebookId: string;
  sbcStatus: string;
  createdAt: string;
  lastVerifiedAt?: string;
  membershipFound?: boolean;
}

interface VerificationStats {
  total: number;
  verifiedMembers: number;
  pendingVerification: number;
  verifiedConversionRate: number;
  lastVerifiedAt: string | null;
}

export const ProspectsPage = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationStats, setVerificationStats] = useState<VerificationStats | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null); // ID of prospect being verified
  const [batchVerifying, setBatchVerifying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prospectsRes, statsRes] = await Promise.all([
        api.get('/prospects'),
        api.get('/prospects/verification-stats')
      ]);
      // Sort by newest first
      const sorted = prospectsRes.data.sort((a: Prospect, b: Prospect) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProspects(sorted);
      setVerificationStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const verifyProspect = async (prospectId: string) => {
    if (verifying || batchVerifying) return;
    
    setVerifying(prospectId);
    try {
      await api.post(`/prospects/verify/${prospectId}`);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(null);
    }
  };

  const batchVerify = async () => {
    if (verifying || batchVerifying) return;
    
    setBatchVerifying(true);
    try {
      await api.post('/prospects/verify-batch');
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Batch verification failed:', err);
    } finally {
      setBatchVerifying(false);
    }
  };

  const filteredProspects = prospects.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.whatsapp.includes(searchTerm)
  );

  const visibleProspects = filteredProspects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProspects.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    return `il y a ${diffDays} j`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Verification Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Prospects</h1>
                <p className="text-slate-500">Gérez tous vos prospects inscrits</p>
            </div>
            <div className="flex gap-2">
                <Button 
                  onClick={batchVerify} 
                  disabled={batchVerifying || verifying !== null}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                    {batchVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {batchVerifying ? 'Vérification...' : 'Vérification en lot'}
                </Button>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                </Button>
            </div>
        </div>

        {/* Verification Stats Banner */}
        {verificationStats && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-xl font-bold text-slate-900">{verificationStats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Membres Vérifiés</p>
                  <p className="text-xl font-bold text-emerald-800">{verificationStats.verifiedMembers}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-orange-200 bg-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-700">En Attente</p>
                  <p className="text-xl font-bold text-orange-800">{verificationStats.pendingVerification}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-violet-200 bg-violet-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <RefreshCw className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-violet-700">Taux de Conversion</p>
                  <p className="text-xl font-bold text-violet-800">{verificationStats.verifiedConversionRate}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Last verified info */}
        {verificationStats?.lastVerifiedAt && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Dernière vérification : {formatTimeAgo(verificationStats.lastVerifiedAt)}</span>
          </div>
        )}

        <Card className="border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom, email ou whatsapp..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrer
                    </Button>
                </div>
            </div>
            
            <div className="overflow-x-auto bg-white min-h-[400px]">
                <table className="w-full">
                    <thead className="bg-slate-50/50 sticky top-0 z-10">
                        <tr>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">NOM</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">CONTACT</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">ID EBOOK</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUT</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">VÉRIFIÉ</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">DATE D'INSCRIPTION</th>
                            <th className="text-left py-3 px-4 md:py-4 md:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                                        <p>Chargement des prospects...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : visibleProspects.map((prospect, index) => (
                            <motion.tr 
                                key={prospect._id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * (index % 15) }}
                                className="hover:bg-slate-50/80 transition-colors"
                            >
                                <td className="py-3 px-4 md:py-4 md:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs shrink-0">
                                            {prospect.firstName[0]}{prospect.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 text-sm">{prospect.firstName} {prospect.lastName}</div>
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
                                <td className="py-3 px-4 md:py-4 md:px-6">
                                    <VerificationBadge 
                                      membershipFound={prospect.membershipFound} 
                                      lastVerifiedAt={prospect.lastVerifiedAt}
                                    />
                                </td>
                                <td className="py-3 px-4 md:py-4 md:px-6 text-sm text-slate-500 hidden lg:table-cell">
                                    {new Date(prospect.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 md:py-4 md:px-6">
                                    {prospect.membershipFound ? (
                                      <span className="text-xs text-emerald-600 font-medium">✓ Converti</span>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => verifyProspect(prospect._id)}
                                        disabled={verifying !== null || batchVerifying}
                                        className="text-xs"
                                      >
                                        {verifying === prospect._id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <RefreshCw className="w-3 h-3 mr-1" />
                                        )}
                                        Vérifier
                                      </Button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                        
                        {!loading && filteredProspects.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Users className="w-12 h-12 mb-3 bg-slate-50 rounded-full p-2" />
                                        <p className="text-base font-medium text-slate-600">Aucun prospect ne correspond à votre recherche</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && filteredProspects.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        Affichage de <span className="font-medium text-slate-900">{visibleProspects.length}</span> sur <span className="font-medium text-slate-900">{filteredProspects.length}</span> prospects
                    </p>
                    
                    {hasMore && (
                        <Button onClick={loadMore} variant="outline" className="w-full sm:w-auto">
                            Charger 15 de plus
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            )}
        </Card>
      </div>
    </AdminLayout>
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

const VerificationBadge = ({ membershipFound, lastVerifiedAt }: { membershipFound?: boolean; lastVerifiedAt?: string }) => {
    if (membershipFound === true) {
        return (
            <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Membre</span>
            </div>
        );
    }
    
    if (lastVerifiedAt) {
        return (
            <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Introuvable</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-500">En attente</span>
        </div>
    );
};
