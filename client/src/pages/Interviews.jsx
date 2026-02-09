import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, CheckCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, completed

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const res = await api.get('/interviews');
            setInterviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredInterviews = interviews.filter(i => {
        if (filter === 'all') return true;
        return i.status === filter;
    });

    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold mb-1">Interviews</h2>
                    <p className="text-gray-400">View and manage all your scheduled sessions</p>
                </header>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        {['all', 'upcoming', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin" size={32} />
                            Loading sessions...
                        </div>
                    ) : filteredInterviews.length > 0 ? (
                        filteredInterviews.map(interview => (
                            <Card key={interview.id} className="hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className={`p-3 rounded-xl ${interview.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {interview.status === 'upcoming' ? <Clock size={24} /> : <CheckCircle size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg leading-tight">{interview.title}</h4>
                                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(interview.scheduledAt).toLocaleDateString()}</span>
                                                <span className="px-2 py-0.5 bg-gray-900 rounded-md text-[10px] uppercase font-bold text-gray-500 border border-gray-800">
                                                    ID: #{interview.id.toString().padStart(4, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${interview.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                            {interview.status}
                                        </span>
                                        {interview.status === 'upcoming' ? (
                                            <Link to={`/interview/${interview.id}`}>
                                                <Button className="text-xs py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                                    Enter Room <ArrowRight size={14} />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button className="text-xs py-1.5 px-4 bg-gray-900 border border-gray-800 text-gray-400 cursor-not-allowed">
                                                Archived
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-10 text-center bg-gray-900/50 rounded-2xl border border-dashed border-gray-800 text-gray-500">
                            No {filter === 'all' ? '' : filter} interviews found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Interviews;
