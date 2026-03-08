// 🗄️ DATABASE CONNECTION FILE 🗄️
// This file is responsible for connecting our Node.js app to our MySQL (TiDB Cloud) database.
// Without this, we can't save users or complaints!

// Import the MySQL driver (helps Node talk to MySQL) and Dotenv (loads secret passwords safely)
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Tell dotenv to find the .env file and load its secrets into memory
dotenv.config();

// Create a "Pool" of connections. A pool is like a group of workers ready to talk to the database.
// Using a pool is better than a single connection because multiple users can talk to the database at the same time.
const pool = mysql.createPool({
    // DB_HOST: Where does the database live? (e.g., our cloud server address)
    host: process.env.DB_HOST || 'localhost',
    // DB_PORT: Which "door" to use when connecting? (MySQL usually uses 3306 or 4000)
    port: process.env.DB_PORT || 3306,
    // DB_USER: The username you use to log into your database
    user: process.env.DB_USER || 'root',
    // DB_PASSWORD: The secret password from your .env file
    password: process.env.DB_PASSWORD || '',
    // DB_NAME: Which folder inside the database are we working in? (like 'fix_my_campus')
    database: process.env.DB_NAME || 'fix_my_campus',
    
    // Cloud databases like TiDB require a secure "SSL" connection to make sure hackers can't intercept our data
    ssl: process.env.DB_HOST !== 'localhost' ? {
        minVersion: 'TLSv1.2',       // Use a modern, secure version of encryption
        rejectUnauthorized: true     // Reject any unsafe connections
    } : undefined, // If running locally, we don't strictly need SSL
    
    waitForConnections: true, // Should we wait if all workers are busy? Yes!
    connectionLimit: 10,      // Maximum 10 workers (connections) talking to the database at the same time
    queueLimit: 0             // No limit on the number of people waiting to connect
});

// Export the pool using '.promise()' 
// Using Promises allows us to use modern JavaScript 'async/await' instead of old messy callbacks!
module.exports = pool.promise();
