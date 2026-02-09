import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Calendar, ExternalLink, Loader2, X, Clock, CheckCircle, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await api.get('/users/candidates');
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (candidate) => {
        setSelectedCandidate(candidate);
        setHistoryLoading(true);
        try {
            const res = await api.get(`/interviews?candidateId=${candidate.id}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleScheduleClick = (email) => {
        navigate(`/dashboard?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold mb-1">Candidates</h2>
                    <p className="text-gray-400">Total {candidates.length} candidates in your network</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                             <Loader2 className="animate-spin mb-2" size={32} />
                             <span className="font-medium">Crunching candidate data...</span>
                        </div>
                    ) : candidates.length > 0 ? (
                        candidates.map(candidate => (
                            <Card key={candidate.id} className="group hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                                <div className="flex gap-4 items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {candidate.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight">{candidate.name || 'Anonymous'}</h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                            <Mail size={12} />
                                            <span>{candidate.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        onClick={() => handleScheduleClick(candidate.email)}
                                        className="w-full text-xs font-bold py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={14} /> Schedule Interview
                                    </Button>
                                    <Button 
                                        onClick={() => fetchHistory(candidate)}
                                        className="w-full text-xs font-bold py-2 bg-transparent text-gray-500 hover:text-white flex items-center justify-center gap-2"
                                    >
                                        View History <ExternalLink size={14} />
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800 text-gray-500">
                            No candidates found. Start by scheduling an interview!
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 border-gray-800 shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                                    {selectedCandidate.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl leading-none">{selectedCandidate.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{selectedCandidate.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {historyLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span>Retrieving history...</span>
                                </div>
                            ) : history.length > 0 ? (
                                history.map(item => (
                                    <div key={item.id} className="p-4 rounded-2xl bg-gray-900/30 border border-gray-800/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white">{item.title}</h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(item.scheduledAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        {item.Feedback && (
                                            <div className="mt-4 pt-4 border-t border-gray-800/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < item.Feedback.rating ? "currentColor" : "none"} className={i < item.Feedback.rating ? "" : "text-gray-700"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400">Rating: {item.Feedback.rating}/5</span>
                                                </div>
                                                <p className="text-sm text-gray-300 italic">"{item.Feedback.comments}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-500">
                                    No past interviews found for this candidate.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Candidates;
