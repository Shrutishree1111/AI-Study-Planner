import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_ultra_secure_secret_key';

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(401).json({ error: 'Admin access required' });
        req.userId = decoded.id;
        next();
    });
};

// Get global stats
router.get('/stats', verifyAdmin, (req, res) => {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const totalHoursResult = db.prepare('SELECT SUM(duration) as total FROM sessions WHERE completed = 1').get();
    const totalHours = totalHoursResult ? totalHoursResult.total : 0;
    const activeSchedules = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM schedules').get().count;

    res.json({
        totalUsers,
        totalHours: Math.round(totalHours / 60),
        activeSchedules
    });
});

// Get all users
router.get('/users', verifyAdmin, (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, daily_goal, created_at FROM users').all();
    res.json(users);
});

export default router;
