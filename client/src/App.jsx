import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/Interviews';
import Candidates from './pages/Candidates';
import Settings from './pages/Settings';
import InterviewRoom from './pages/InterviewRoom';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Auth type="login" />} />
                    <Route path="/register" element={<Auth type="register" />} />

                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/interviews" element={<PrivateRoute><Interviews /></PrivateRoute>} />
                    <Route path="/candidates" element={<PrivateRoute><Candidates /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/interview/:id" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;
