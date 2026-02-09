import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Auth = ({ type }) => {
    const isLogin = type === 'login';
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.name, formData.email, formData.password, formData.role);
        }

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0a]">
            <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-white">&larr; Back to Home</Link>
            <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-400">Enter your details to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />}
                    <Input placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <Input placeholder="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setFormData({ ...formData, role: 'candidate' })} className={clsx("py-3 rounded-lg border transition-all", formData.role === 'candidate' ? "bg-blue-600 border-blue-600 text-white" : "border-gray-700 text-gray-400 hover:bg-gray-800")}>Candidate</button>
                                <button type="button" onClick={() => setFormData({ ...formData, role: 'interviewer' })} className={clsx("py-3 rounded-lg border transition-all", formData.role === 'interviewer' ? "bg-purple-600 border-purple-600 text-white" : "border-gray-700 text-gray-400 hover:bg-gray-800")}>Interviewer</button>
                            </div>
                        </div>
                    )}
                    <Button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 py-3 mt-4">
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                </form>
                <p className="mt-6 text-center text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link to={isLogin ? '/register' : '/login'} className="text-blue-400 hover:underline">{isLogin ? 'Sign up' : 'Login'}</Link>
                </p>
            </Card>
        </div>
    );
};

export default Auth;
