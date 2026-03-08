CREATE DATABASE IF NOT EXISTS fix_my_campus;
USE fix_my_campus;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Electrical', 'Water', 'Cleanliness', 'Infrastructure', 'Internet', 'Safety', 'Others') NOT NULL,
    location VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('Pending', 'In Progress', 'Resolved', 'Spam', 'Deleted') DEFAULT 'Pending',
    assigned_to VARCHAR(100),
    assigned_contact VARCHAR(50),
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
