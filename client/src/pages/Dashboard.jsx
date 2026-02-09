import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    // Schedule Form State
    const [newInterview, setNewInterview] = useState({ title: '', scheduledAt: '', candidateEmail: '' });

    useEffect(() => {
        fetchInterviews();

        // Handle query params
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        if (email) {
            setShowScheduleForm(true);
            setNewInterview(prev => ({ ...prev, candidateEmail: email }));
            // Clear param
            navigate('/dashboard', { replace: true });
        }
    }, [location.search, navigate]);

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

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/interviews', newInterview);
            setShowScheduleForm(false);
            setNewInterview({ title: '', scheduledAt: '', candidateEmail: '' });
            fetchInterviews();
        } catch (err) {
            alert('Failed to schedule: ' + (err.response?.data?.message || err.message));
        }
    };

    // Stats
    const upcomingCount = interviews.filter(i => i.status === 'upcoming').length;
    const completedCount = interviews.filter(i => i.status === 'completed').length;

    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
                        <p className="text-gray-400">Manage your interviews and track performance</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 pr-4 pl-2 py-2 rounded-full border border-gray-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0].toUpperCase()}</div>
                        <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={64} /></div>
                        <h3 className="text-4xl font-bold text-white mb-1">{upcomingCount}</h3>
                        <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">Upcoming</p>
                    </Card>
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle size={64} /></div>
                        <h3 className="text-4xl font-bold text-white mb-1">{completedCount}</h3>
                        <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Completed</p>
                    </Card>
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Star size={64} /></div>
                        {/* Mock Rating */}
                        <h3 className="text-4xl font-bold text-white mb-1">--</h3>
                        <p className="text-purple-400 text-sm font-medium uppercase tracking-wider">Rating</p>
                    </Card>
                </div>

                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold">Your Sessions</h3>
                    {user?.role === 'interviewer' && (
                        <Button onClick={() => setShowScheduleForm(!showScheduleForm)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white">
                            {showScheduleForm ? 'Cancel' : '+ Schedule New'}
                        </Button>
                    )}
                </div>

                {showScheduleForm && (
                    <Card className="mb-8 border-blue-900/50 bg-blue-900/10 animate-in fade-in slide-in-from-top-4">
                        <h4 className="font-bold mb-4">New Interview</h4>
                        <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <Input placeholder="Role Title (e.g. React Dev)" value={newInterview.title} onChange={e => setNewInterview({ ...newInterview, title: e.target.value })} required />
                            <Input placeholder="Candidate Email" type="email" value={newInterview.candidateEmail} onChange={e => setNewInterview({ ...newInterview, candidateEmail: e.target.value })} required />
                            <Input type="datetime-local" value={newInterview.scheduledAt} onChange={e => setNewInterview({ ...newInterview, scheduledAt: e.target.value })} required className="text-gray-400" />
                            <Button className="bg-blue-600 text-white h-[50px]">Schedule</Button>
                        </form>
                    </Card>
                )}

                <div className="space-y-3">
                    {loading ? <p className="text-gray-500">Loading interviews...</p> : interviews.length === 0 ? (
                        <p className="text-gray-500 py-10 text-center bg-gray-900/50 rounded-xl border border-dashed border-gray-800">No interviews found.</p>
                    ) : (
                        interviews.map(i => (
                            <div key={i.id} className="group bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition-all">
                                <div className="flex gap-5 items-center">
                                    <div className={cn("w-14 h-14 rounded-lg flex flex-col items-center justify-center border font-bold text-sm", i.status === 'upcoming' ? "bg-blue-900/20 border-blue-900 text-blue-400" : "bg-gray-800 border-gray-700 text-gray-500")}>
                                        <span>{new Date(i.scheduledAt).getDate()}</span>
                                        <span className="text-xs uppercase font-normal">{new Date(i.scheduledAt).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{i.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>
                                                {user.role === 'interviewer'
                                                    ? `Candidate: ${i.Candidate?.name || i.Candidate?.email || 'Unknown'}`
                                                    : `Interviewer: ${i.Interviewer?.name || i.Interviewer?.email || 'Unknown'}`}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(i.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {i.status === 'upcoming' && (
                                        <>
                                            <Button onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/interview/${i.id}`);
                                                alert('Interview link copied to clipboard!');
                                            }} className="bg-gray-800 hover:bg-gray-700 text-sm py-2 px-4 border border-gray-700">
                                                Copy Link
                                            </Button>
                                            <Link to={`/interview/${i.id}`}>
                                                <Button className="bg-white text-black hover:bg-gray-200 text-sm py-2 px-6 shadow-lg shadow-white/5">Join Room</Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
