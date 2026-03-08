const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function resetWebsite() {
    console.log('Starting website reset...');

    // 1. Clear database tables
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'fix_my_campus'
        });

        console.log('Connected to the database. Clearing complaints...');

        // Truncate the complaints table to remove all rows and reset auto-increment IDs
        await connection.execute('TRUNCATE TABLE complaints');
        console.log('✅ All complaints deleted from the database.');

        // Optionally, if you also want to delete all users (except admin), uncomment the following lines:
        // await connection.execute('DELETE FROM users WHERE role != "admin"');
        // console.log('✅ Non-admin users deleted.');

        await connection.end();
    } catch (dbError) {
        console.error('❌ Error resetting database:', dbError.message);
    }

    // 2. Clear uploaded files
    const uploadsDir = path.join(__dirname, 'uploads');
    try {
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                // Ignore a .gitkeep or dummy file if present, though likely safe to delete all
                if (file !== '.gitkeep') {
                    fs.unlinkSync(path.join(uploadsDir, file));
                }
            }
            console.log('✅ All uploaded files deleted from /uploads directory.');
        } else {
            console.log('Uploads directory not found; skipping file deletion.');
        }
    } catch (fsError) {
        console.error('❌ Error deleting uploaded files:', fsError.message);
    }

    console.log('Reset complete! Your website is now fresh.');
}

resetWebsite();
