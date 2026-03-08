// 🛡️ AUTHENTICATION CONTROLLER 🛡️
// This file handles all things related to user accounts: Signing up, Logging in, and Resetting passwords!

const db = require('../config/db');        // Import our database connection pool
const jwt = require('jsonwebtoken');       // Import JSON Web Tokens (JWT) used for creating secure login "tickets"

// --- 1. REGISTER A NEW USER ---
exports.register = async (req, res) => {
    try {
        // Grab the info the user typed into the registration form
        const { username, email, password, role } = req.body;

        // Step A: Check if this email is already registered in our database
        // We use the '?' placeholder to prevent hackers from doing SQL Injection attacks!
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            // Uh oh, someone already used this email! Send a 400 Bad Request error.
            return res.status(400).json({ message: 'User already exists' });
        }

        // Step B: If someone is trying to register as an 'admin', check if they know the secret password
        if (role === 'admin') {
            const ADMIN_SECRET = 'CAMPUS_ADMIN_2024';
            if (req.body.adminCode !== ADMIN_SECRET) {
                // Wrong secret code! Send a 403 Forbidden error.
                return res.status(403).json({ message: 'Invalid Admin Secret Code' });
            }
        }

        // Step C: Ensure the role is strictly either 'admin' or 'student'. 
        // If they tried to sneak in as 'superhacker', default them to 'student'.
        const userRole = role === 'admin' ? 'admin' : 'student';

        // Step D: Insert the new user's details into the database to permanently save them
        await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, userRole]
        );

        // Success! Send a 201 Created message back to the website
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error); // Print the error to our server logs to help us fix it later
        res.status(500).json({ message: 'Server error' });
    }
};

// --- 2. LOG IN AN EXISTING USER ---
exports.login = async (req, res) => {
    try {
        // Grab their email and password from the login form
        const { email, password } = req.body;

        // Step A: Look up the user in the database using their email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        // If the user array is empty, this email doesn't exist
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0]; // Get the first (and only) user from the search results

        // Step B: Check if the password they typed matches the password in the database
        // Note: In real-world enterprise apps, passwords should be encrypted using a tool like bcrypt!
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Step C: They passed! Create a secure "Login Ticket" (JWT) for them.
        // This ticket will allow them to access their dashboard without logging in again for 1 hour.
        const token = jwt.sign(
            { userId: user.id, role: user.role }, // Stuff the ticket with their ID and Role
            process.env.JWT_SECRET,               // Sign it with our secret key so nobody can forge it
            { expiresIn: '1h' }                   // The ticket expires in 1 Hour
        );

        // Send the token back to their browser
        res.json({ token, userId: user.id, username: user.username, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- 3. RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
    try {
        // Grab their email and the completely new password they want
        const { email, newPassword } = req.body;

        // Step A: Check if the email exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' }); // Return 404 (Not Found)
        }

        // Step B: Update their old password to the new one in the database
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
        
        // Send success message
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
