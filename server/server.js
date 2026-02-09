import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'shinesoon_secret_key_change_me';

app.use(cors());
app.use(express.json());

// Database Setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// Models
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('interviewer', 'candidate'), defaultValue: 'candidate' }
});

const Interview = sequelize.define('Interview', {
    title: { type: DataTypes.STRING, allowNull: false },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('upcoming', 'completed', 'cancelled'), defaultValue: 'upcoming' },
    meetingLink: { type: DataTypes.STRING } // For actual video call integration later
});

const Feedback = sequelize.define('Feedback', {
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comments: { type: DataTypes.TEXT }
});

// Relationships
User.hasMany(Interview, { as: 'HostedInterviews', foreignKey: 'interviewerId' });
User.hasMany(Interview, { as: 'AttendedInterviews', foreignKey: 'candidateId' });
Interview.belongsTo(User, { as: 'Interviewer', foreignKey: 'interviewerId' });
Interview.belongsTo(User, { as: 'Candidate', foreignKey: 'candidateId' });

Interview.hasOne(Feedback);
Feedback.belongsTo(Interview);

// Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password || !name) return res.status(400).json({ message: 'All fields required' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/interviews', authenticate, async (req, res) => {
    try {
        const { candidateId } = req.query;
        let where = req.user.role === 'interviewer'
            ? { interviewerId: req.user.id }
            : { candidateId: req.user.id };

        if (candidateId && req.user.role === 'interviewer') {
            where.candidateId = candidateId;
        }

        const interviews = await Interview.findAll({
            where,
            include: [
                { model: User, as: 'Interviewer', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'Candidate', attributes: ['id', 'name', 'email'] },
                { model: Feedback }
            ],
            order: [['scheduledAt', 'DESC']]
        });
        res.json(interviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Interview
app.post('/api/interviews', authenticate, async (req, res) => {
    if (req.user.role !== 'interviewer') return res.status(403).json({ message: 'Only interviewers can schedule' });
    try {
        const { title, scheduledAt, candidateEmail } = req.body;

        // Find candidate or create a placeholder
        let candidate = await User.findOne({ where: { email: candidateEmail } });
        if (!candidate) {
            // Create a temporary/placeholder user
            candidate = await User.create({
                name: candidateEmail.split('@')[0], // Default name from email
                email: candidateEmail,
                password: await bcrypt.hash('temp_password_123', 10), // secure temporary password
                role: 'candidate'
            });
        }

        const interview = await Interview.create({
            title,
            scheduledAt,
            interviewerId: req.user.id,
            candidateId: candidate.id
        });
        res.status(201).json(interview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Submit Feedback
app.post('/api/feedback', authenticate, async (req, res) => {
    if (req.user.role !== 'interviewer') return res.status(403).json({ message: 'Only interviewers can leave feedback' });
    try {
        const { interviewId, rating, comments } = req.body;
        const feedback = await Feedback.create({
            interviewId,
            rating,
            comments
        });
        // Update interview status
        await Interview.update({ status: 'completed' }, { where: { id: interviewId } });
        res.status(201).json(feedback);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get Public Interview Details
app.get('/api/interviews/:id/public', async (req, res) => {
    try {
        const interview = await Interview.findByPk(req.params.id, {
            include: [
                { model: User, as: 'Interviewer', attributes: ['name'] },
                { model: User, as: 'Candidate', attributes: ['name'] }
            ]
        });
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.json(interview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
app.put('/api/users/profile', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        await User.update({ name }, { where: { id: req.user.id } });
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Unique Candidates for Interviewer
app.get('/api/users/candidates', authenticate, async (req, res) => {
    if (req.user.role !== 'interviewer') return res.status(403).json({ message: 'Forbidden' });
    try {
        const interviews = await Interview.findAll({
            where: { interviewerId: req.user.id },
            include: [{ model: User, as: 'Candidate', attributes: ['id', 'name', 'email'] }]
        });
        const candidates = Array.from(new Set(interviews.map(i => JSON.stringify(i.Candidate))))
            .map(c => JSON.parse(c))
            .filter(c => c !== null);
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync and Start
let server;
sequelize.sync().then(() => {
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Initialize Socket.io after server starts
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        // ... (same as before) ...
        console.log('New client connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('screen-share-signal', (data) => {
            socket.to(data.roomId).emit('screen-share-signal', data);
        });

        socket.on('call-signal', (data) => {
            socket.to(data.roomId).emit('call-signal', data);
        });

        socket.on('chat-message', (data) => {
            socket.to(data.roomId).emit('chat-message', data);
        });

        socket.on('code-update', (data) => {
            // Broadcast code changes to others in the room
            socket.to(data.roomId).emit('code-update', data.code);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

}).catch(err => console.error('Database sync error:', err));
