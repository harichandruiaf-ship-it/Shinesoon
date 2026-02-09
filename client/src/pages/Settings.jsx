import { useState } from 'react';
import { User, Shield, Bell, Globe, Save, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'general', name: 'General', icon: Globe },
    ];

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/users/profile', { name });
            updateUser({ name });
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold mb-1">Settings</h2>
                    <p className="text-gray-400">Manage your account preferences and system configuration</p>
                </header>

                <div className="flex gap-8">
                    <div className="w-64 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                            >
                                <tab.icon size={18} />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 max-w-2xl">
                        <Card className="p-8">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                            {name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{user?.name}</h3>
                                            <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
                                            <button className="text-blue-400 text-xs mt-2 font-bold hover:underline">Change Avatar</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-medium">Full Name</label>
                                            <Input value={name} onChange={e => setName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-medium">Email Address</label>
                                            <Input defaultValue={user?.email} disabled />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium">Bio</label>
                                        <textarea className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 h-24" placeholder="Tell us about yourself..." />
                                    </div>

                                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                                        <Button 
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="p-10 text-center text-gray-500">
                                    Security settings are currently read-only in this demo.
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
