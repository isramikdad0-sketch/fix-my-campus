const db = require('../config/db');

exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category, location } = req.body;
        const userId = req.user.userId;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        await db.execute(
            'INSERT INTO complaints (user_id, title, description, category, location, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, category, location, imageUrl]
        );

        res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { status, category } = req.query;

        let query = 'SELECT c.*, u.username FROM complaints c JOIN users u ON c.user_id = u.id';
        let params = [];
        let conditions = [];

        // Filter by user role if needed
        if (role === 'student') {
            conditions.push('c.user_id = ?');
            params.push(userId);
        }

        if (status && status !== 'all') {
            conditions.push('c.status = ?');
            params.push(status);
        }

        if (category) {
            conditions.push('c.category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await db.execute(query, params);
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to, assigned_contact } = req.body;

        let query = 'UPDATE complaints SET status = ?';
        let params = [status];

        if (assigned_to) {
            query += ', assigned_to = ?';
            params.push(assigned_to);
        }

        if (assigned_contact) {
            query += ', assigned_contact = ?';
            params.push(assigned_contact);
        }

        if (status === 'Resolved') {
            query += ', resolved_at = NOW()';
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.execute(query, params);
        res.json({ message: 'Complaint updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        if (role === 'admin') {
            // Admin soft delete (mark as Deleted) so it stays in stats
            await db.execute('UPDATE complaints SET status = "Deleted" WHERE id = ?', [id]);
            return res.json({ message: 'Complaint marked as deleted' });
        }

        // Students can only delete their own pending complaints
        if (role === 'student') {
            const [complaint] = await db.execute('SELECT * FROM complaints WHERE id = ?', [id]);
            if (complaint.length === 0) return res.status(404).json({ message: 'Not found' });

            if (complaint[0].user_id !== userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (complaint[0].status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot delete processed complaint' });
            }

            // Student hard delete (or soft? Let's keep hard for now as per previous logic, or soft if they want stats too. Assume hard for student drafts)
            await db.execute('DELETE FROM complaints WHERE id = ?', [id]);
        }

        res.json({ message: 'Complaint deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicStats = async (req, res) => {
    try {
        // Aggregate counts
        const [counts] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0) as resolved,
                COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) as in_progress,
                COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN status = 'Spam' THEN 1 ELSE 0 END), 0) as spam,
                COALESCE(SUM(CASE WHEN status = 'Deleted' THEN 1 ELSE 0 END), 0) as deleted
            FROM complaints
        `);

        // Get recent complaints (Anonymized: NO username, NO user_id)
        // Only public fields: category, title, status, assigned_to, created_at
        // Exclude 'Deleted' from the visible table list, but they are counted in stats above.
        const [recent] = await db.execute(`
            SELECT title, category, status, assigned_to, created_at 
            FROM complaints 
            WHERE status != 'Deleted'
            ORDER BY created_at DESC 
            LIMIT 50
        `);

        res.json({ stats: counts[0], recent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
