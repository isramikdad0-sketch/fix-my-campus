const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check admin permissions
        if (role === 'admin') {
            const ADMIN_SECRET = 'CAMPUS_ADMIN_2024';
            if (req.body.adminCode !== ADMIN_SECRET) {
                return res.status(403).json({ message: 'Invalid Admin Secret Code' });
            }
        }

        const userRole = role === 'admin' ? 'admin' : 'student';

        await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, userRole]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Validate password
        // Note: Production apps should use bcrypt for hashing
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user.id, username: user.username, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.execute('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
