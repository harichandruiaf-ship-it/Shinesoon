import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, Calendar, CheckCircle, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const active = location.pathname.substring(1); // 'dashboard', 'interviews', etc.

    const links = [
        { name: 'Dashboard', icon: CheckCircle, path: '/dashboard' },
        { name: 'Interviews', icon: Calendar, path: '/interviews' },
        { name: 'Candidates', icon: UserIcon, path: '/candidates' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside className="w-64 border-r border-gray-800 flex flex-col p-6 bg-[#0c0c0c]">
            <div className="mb-10 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <h1 className="text-xl font-bold tracking-tight">shinesoon</h1>
            </div>
            <nav className="flex-1 space-y-2">
                {links.map(l => (
                    <Link key={l.path} to={l.path}>
                        <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", active.includes(l.name.toLowerCase()) ? "bg-blue-600/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-gray-900 hover:text-white")}>
                            <l.icon size={18} />
                            <span>{l.name}</span>
                        </div>
                    </Link>
                ))}
            </nav>
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-900 hover:text-white transition-colors mt-auto w-full text-left">
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </aside>
    )
}

export default Sidebar;
