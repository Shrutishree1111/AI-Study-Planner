import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_ultra_secure_secret_key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Get user schedule
router.get('/', verifyToken, (req, res) => {
    const schedule = db.prepare('SELECT * FROM schedules WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.userId);
    res.json(schedule ? JSON.parse(schedule.week_json) : { week: [] });
});

// Save/Update schedule
router.post('/', verifyToken, (req, res) => {
    const { week } = req.body;
    const weekJson = JSON.stringify({ week });
    const existing = db.prepare('SELECT id FROM schedules WHERE user_id = ?').get(req.userId);

    if (existing) {
        db.prepare('UPDATE schedules SET week_json = ? WHERE user_id = ?').run(weekJson, req.userId);
    } else {
        db.prepare('INSERT INTO schedules (user_id, week_json) VALUES (?, ?)').run(req.userId, weekJson);
    }
    res.json({ message: 'Schedule saved successfully' });
});

export default router;
