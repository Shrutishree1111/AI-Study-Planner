import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_ultra_secure_secret_key';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Get today's sessions
router.get('/today', verifyToken, (req, res) => {
    const date = new Date().toISOString().split('T')[0];
    const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ? AND date = ?').all(req.userId, date);
    res.json(sessions);
});

// Log a session
router.post('/log', verifyToken, (req, res) => {
    const { subject, topic, duration, completed, date } = req.body;
    db.prepare(`
        INSERT INTO sessions (user_id, subject, topic, duration, completed, date)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.userId, subject, topic, duration, completed ? 1 : 0, date);
    res.json({ message: 'Session logged' });
});

export default router;
