import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, 
    MessageSquare, Code, Terminal, BrainCircuit, Zap, 
    ChevronRight, Send, User, UserCheck, Phone,
    Target, Lightbulb, ShieldAlert, Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const InterviewRoom = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // --- State Management ---
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([
        { sender: 'System', text: 'Initializing secure connection...', time: new Date().toLocaleTimeString() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [code, setCode] = useState(`function solution(input) {\n    // Write your solution here\n    return input;\n}`);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    // Tab State
    const [activeRightTab, setActiveRightTab] = useState('chat');
    const [activeAITab, setActiveAITab] = useState('questions');
    const [skills, setSkills] = useState({ Logic: 70, Design: 50, Velocity: 80, Communication: 60 });
    const [feedbackComments, setFeedbackComments] = useState('');

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const streamRef = useRef(null);

    const aiSuggestions = [
        { id: 1, category: 'Optimization', text: "How would you reduce Time Complexity?", icon: Zap, color: 'text-yellow-500' },
        { id: 2, category: 'Stability', text: "What happens with edge-case (null/NaN) inputs?", icon: ShieldAlert, color: 'text-red-500' },
        { id: 3, category: 'Concurrency', text: "Could this be solved using multi-threading?", icon: Lightbulb, color: 'text-purple-500' }
    ];

    // --- Role-Based Init ---
    useEffect(() => {
        if (user?.role === 'interviewer') {
            setActiveRightTab('intel');
        } else {
            setActiveRightTab('chat');
        }
    }, [user]);

    // --- Media Setup ---
    useEffect(() => {
        if (!user) return;

        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                setMessages(prev => [...prev, { sender: 'System', text: 'Hardware access granted.', time: new Date().toLocaleTimeString() }]);
            } catch (err) {
                console.error("Media error:", err);
                setMessages(prev => [...prev, { sender: 'System', text: 'Error: Media access denied.', time: new Date().toLocaleTimeString() }]);
            }
        };

        startMedia();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [user]);

    // --- Socket & RTC Orchestration ---
    useEffect(() => {
        if (!user) return;

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        newSocket.emit('join-room', id);

        // Notify presence
        newSocket.emit('call-signal', { roomId: id, type: 'join', role: user.role, name: user.name });

        newSocket.on('code-update', (data) => setCode(data));
        newSocket.on('chat-message', (msg) => setMessages(prev => [...prev, msg]));

        newSocket.on('call-signal', async (data) => {
            console.log("RTC Signal:", data.type);
            
            if (data.type === 'join' && user.role === 'interviewer') {
                // If candidate just joined, or someone joined, we are ready to connect
                newSocket.emit('call-signal', { roomId: id, type: 'ready' });
            }
            else if (data.type === 'ready' && user.role === 'candidate') {
                initiateHandshake(newSocket);
            }
            else if (data.type === 'offer') {
                acceptOffer(newSocket, data.sdp);
            }
            else if (data.type === 'answer' && pcRef.current) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
            else if (data.type === 'candidate' && pcRef.current) {
                try { await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) {}
            }
        });

        return () => newSocket.disconnect();
    }, [id, user]);

    // RTC Functions
    const setupPC = (sock) => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcRef.current = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) sock.emit('call-signal', { roomId: id, type: 'candidate', candidate: e.candidate });
        };
        pc.ontrack = (e) => {
            setRemoteStream(e.streams[0]);
            setIsCallActive(true);
        };
        
        const currentStream = streamRef.current;
        if (currentStream) {
            currentStream.getTracks().forEach(t => pc.addTrack(t, currentStream));
        }
        return pc;
    };

    const initiateHandshake = async (sock) => {
        const pc = setupPC(sock);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sock.emit('call-signal', { roomId: id, type: 'offer', sdp: offer });
    };

    const acceptOffer = async (sock, sdp) => {
        const pc = setupPC(sock);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sock.emit('call-signal', { roomId: id, type: 'answer', sdp: answer });
    };

    // --- UI Helpers ---
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    // Ensure local video stays attached even after tab flips
    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream, activeRightTab]);

    if (!user) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-bold uppercase tracking-widest animate-pulse">Routing Session...</div>;

    const sendChat = (e) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;
        const msg = { sender: user.name || 'User', text: chatInput, time: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, msg]);
        socket?.emit('chat-message', { roomId: id, ...msg });
        setChatInput('');
    };

    const dropAIQuestion = (text) => {
        const msg = { sender: `${user.name} (Suggested)`, text, time: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, msg]);
        socket?.emit('chat-message', { roomId: id, ...msg });
        setActiveRightTab('chat');
    };

    const finishSession = async () => {
        setIsEnding(true);
        try {
            const rating = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / 80);
            await api.post('/feedback', { interviewId: id, rating: Math.max(1, rating), comments: feedbackComments || "Evaluation complete." });
            navigate('/dashboard');
        } catch (err) { setIsEnding(false); }
    };

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            {/* Nav */}
            <header className="px-6 py-4 border-b border-gray-900 flex justify-between items-center bg-[#080808] z-30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl italic shadow-[0_0_20px_rgba(37,99,235,0.2)]">S</div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight uppercase">Interview <span className="text-blue-500">#{id?.slice(0,5)}</span></h1>
                        <p className="text-[9px] font-black text-gray-600 tracking-[0.4em] uppercase mt-1">
                            {isCallActive ? <span className="text-green-500">Active Node</span> : "Syncing Node..."}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                   <Button onClick={() => user.role === 'interviewer' ? setShowFeedbackModal(true) : navigate('/dashboard')} className="bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold py-2 px-6 uppercase tracking-widest rounded-xl">
                      Terminate
                   </Button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left: Editor */}
                <div className="flex-1 flex flex-col border-r border-gray-900 bg-[#070707]">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-900 bg-[#0a0a0a]">
                        <div className="flex items-center gap-2"><Code size={14} className="text-blue-500"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Workspace</span></div>
                    </div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={code} 
                            onChange={(e) => { setCode(e.target.value); socket?.emit('code-update', { roomId: id, code: e.target.value }); }} 
                            spellCheck="false" 
                            className="absolute inset-0 w-full h-full bg-transparent p-10 font-mono text-sm leading-relaxed text-blue-50/80 outline-none resize-none" 
                        />
                    </div>
                    <div className="h-32 border-t border-gray-900 bg-[#050505] p-5">
                       <div className="flex-1 h-full rounded-xl bg-black/40 border border-gray-900 p-4 font-mono text-[10px] text-green-500/70 overflow-hidden">
                          &gt; {isCallActive ? "encrypted peer link established" : "waiting for remote peer handshake"} <br />
                          &gt; packet latency: optimal
                       </div>
                    </div>
                </div>

                {/* Right: Interaction */}
                <aside className="w-[400px] flex flex-col bg-[#050505] border-l border-gray-900">
                    {/* Primary Feed */}
                    <div className="p-4 border-b border-gray-900">
                        <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Remote Session</span></div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
                            {remoteStream ? <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/40 animate-pulse text-gray-800"><User size={32}/></div>}
                        </div>
                    </div>

                    {/* Panels */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="flex gap-1.5 p-1 bg-black rounded-2xl mb-5 border border-gray-800">
                            {user.role === 'interviewer' && <button onClick={() => setActiveRightTab('intel')} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeRightTab === 'intel' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-650'}`}>Intelligence</button>}
                            <button onClick={() => setActiveRightTab('chat')} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeRightTab === 'chat' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-650'}`}>Chat</button>
                            <button onClick={() => setActiveRightTab('self')} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeRightTab === 'self' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-650'}`}>Camera</button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {activeRightTab === 'chat' ? (
                                <div className="flex-1 h-full flex flex-col bg-gray-900/10 rounded-3xl border border-gray-900 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {messages.map((m, i) => (
                                            <div key={i} className={`flex flex-col ${m.sender.includes(user.name) ? 'items-end' : 'items-start'}`}>
                                                <span className="text-[9px] text-gray-600 font-bold mb-1 uppercase tracking-tighter">{m.sender}</span>
                                                <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${m.sender.includes(user.name) ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800/80 text-gray-300 rounded-tl-none border border-gray-700'}`}>{m.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={sendChat} className="p-2.5 bg-black/50 border-t border-gray-900 flex gap-2">
                                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500" placeholder="Type message..." />
                                        <button type="submit" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Send size={16} /></button>
                                    </form>
                                </div>
                            ) : activeRightTab === 'intel' ? (
                                <div className="flex-1 h-full bg-gray-900/10 border border-gray-900 rounded-3xl p-6 flex flex-col overflow-hidden">
                                     <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2"><BrainCircuit size={16} className="text-blue-500" /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Co-Pilot</span></div>
                                        <div className="flex gap-1 bg-black p-0.5 rounded-lg border border-gray-800">
                                            <button onClick={() => setActiveAITab('questions')} className={`px-3 py-1 text-[8px] font-bold rounded-md ${activeAITab === 'questions' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>QUESTIONS</button>
                                            <button onClick={() => setActiveAITab('radar')} className={`px-3 py-1 text-[8px] font-bold rounded-md ${activeAITab === 'radar' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>MATRIX</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {activeAITab === 'radar' ? (
                                            <div className="space-y-5">
                                                {Object.entries(skills).map(([name, val]) => (
                                                    <div key={name} className="space-y-1.5">
                                                        <div className="flex justify-between text-[9px] uppercase font-bold text-gray-600 tracking-widest"><span>{name}</span><span className="text-blue-400">{val}%</span></div>
                                                        <div className="h-1 bg-gray-950 rounded-full overflow-hidden relative border border-gray-900"><div className="h-full bg-blue-500" style={{ width: `${val}%` }}></div><input type="range" value={val} onChange={(e) => setSkills({...skills, [name]: parseInt(e.target.value)})} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {aiSuggestions.map(s => (
                                                    <div key={s.id} className="p-4 bg-gray-950 border border-gray-900 rounded-2xl hover:border-blue-500/30 transition-all">
                                                        <div className="flex gap-3 mb-3">
                                                           <s.icon size={14} className={`${s.color} mt-0.5`} />
                                                           <p className="text-[11px] text-gray-400 leading-relaxed">{s.text}</p>
                                                        </div>
                                                        <button onClick={() => dropAIQuestion(s.text)} className="w-full py-1.5 bg-gray-900 hover:bg-blue-600 text-[8px] font-bold uppercase tracking-widest text-gray-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-all">POST TO CHAT <ChevronRight size={10}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 h-full bg-black rounded-3xl border border-gray-900 relative overflow-hidden group shadow-2xl">
                                    {localStream ? <video ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted /> : <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-[10px] uppercase font-bold tracking-widest">Camera Inactive</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>

            <footer className="h-20 bg-[#080808] border-t border-gray-900 px-10 flex justify-between items-center z-20">
                <div className="flex gap-4">
                   <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 shadow-xl' : 'bg-gray-950 border border-gray-900 text-gray-400'}`}>{isMuted ? <MicOff size={20} /> : <Mic size={20} />}</button>
                   <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-600 shadow-xl' : 'bg-gray-950 border border-gray-900 text-gray-400'}`}>{isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}</button>
                </div>
                <div className="flex items-center gap-2 px-5 py-2 bg-gray-950 rounded-full border border-gray-900"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div><span className="text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase">System Ready</span></div>
                <div className="w-12"></div>
            </footer>

            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <Card className="w-full max-w-sm border-gray-800 bg-[#0a0a0a] shadow-3xl">
                        <div className="flex items-center gap-4 mb-8"><div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><UserCheck size={20} /></div><div><h2 className="text-lg font-bold">Session Review</h2><p className="text-gray-500 text-[10px]">Submit to finalize evaluations.</p></div></div>
                        <textarea value={feedbackComments} onChange={e => setFeedbackComments(e.target.value)} className="w-full h-32 bg-gray-950 border border-gray-900 rounded-2xl p-4 text-white text-xs outline-none mb-6 focus:border-blue-500" placeholder="Notes..." />
                        <div className="flex gap-2.5">
                            <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-3 bg-gray-950 border border-gray-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-600">Back</button>
                            <button onClick={finishSession} disabled={isEnding} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest">Submit</button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InterviewRoom;
