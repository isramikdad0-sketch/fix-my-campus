# Fix My Campus

A complete, responsive web application for reporting and managing campus maintenance issues.

## Features
- **User Authentication**: Secure Login and Registration (Student/Admin roles).
- **Complaint Management**: Report issues with categories, location, and images.
- **Admin Dashboard**: Update status (Pending -> In Progress -> Resolved) and delete invalid complaints.
- **Responsive UI**: Works on Mobile, Tablet, and Desktop.
- **Modern Design**: Aesthetic UI with glassmorphism and animations.

## Tech Stack
- Frontend: HTML5, CSS3 (Vanilla), JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Auth: JWT (JSON Web Tokens)

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MySQL Server installed and running

### 2. Database Setup
1. Open your MySQL Client (Workbench or Command Line).
2. Create the database and tables using the `schema.sql` file provided in this project.
   ```sql
   source schema.sql;
   ```

### 3. Application Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Environment Variables:
   - Create a `.env` file (or edit the existing one) and update DB credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=fix_my_campus
     JWT_SECRET=your_super_secret_key
     ```

### 4. Run the Server
```bash
npm start
```
The server will start at `http://localhost:3000`.

### 5. Access the App
- Landing Page: `http://localhost:3000/`
- Login: `http://localhost:3000/login.html`

## Default Admin
To create an admin account, register a new user and update their role to 'admin' in the database. Alternatively, use the registration form to create an admin account directly.
