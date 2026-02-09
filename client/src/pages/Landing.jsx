import { Link, Navigate } from 'react-router-dom';
import { Video, Code, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Landing = () => {
    const { user } = useAuth();

    if (user) return <Navigate to="/dashboard" />;

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
            <header className="px-6 py-6 flex items-center justify-between border-b border-gray-900 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">shinesoon</h1>
                <nav className="space-x-4">
                    <Link to="/login"><Button className="text-gray-300 hover:text-white">Login</Button></Link>
                    <Link to="/register"><Button className="bg-white text-black hover:bg-gray-200">Get Started</Button></Link>
                </nav>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2"></div>
                <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight z-0">The Future of <br /><span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Tech Interviews</span></h2>
                <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed z-0">Streamlined scheduling, live coding environments, and instant AI-powered feedback. Everything you need to find your next star developer.</p>
                <div className="flex gap-4 z-0">
                    <Link to="/register"><Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 shadow-lg shadow-blue-900/20">Start Hiring</Button></Link>
                    <Link to="/register"><Button className="bg-gray-800 hover:bg-gray-700 text-white text-lg px-8 py-3 border border-gray-700">Candidate View</Button></Link>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
                    <Card className="bg-gray-900/50 hover:bg-gray-900 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400 mb-4"><Video /></div>
                        <h3 className="text-xl font-bold mb-2">HD Video & Screen</h3>
                        <p className="text-gray-400">Crystal clear video calls with integrated screen sharing for seamless collaboration.</p>
                    </Card>
                    <Card className="bg-gray-900/50 hover:bg-gray-900 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400 mb-4"><Code /></div>
                        <h3 className="text-xl font-bold mb-2">Live Code Editor</h3>
                        <p className="text-gray-400">Multi-language support with syntax highlighting and real-time execution.</p>
                    </Card>
                    <Card className="bg-gray-900/50 hover:bg-gray-900 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400 mb-4"><Star /></div>
                        <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
                        <p className="text-gray-400">Structured evaluation forms and scoring to make data-driven hiring decisions.</p>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Landing;
