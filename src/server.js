// 🌟 WELCOME TO THE MAIN SERVER FILE! 🌟
// This file is the "brain" or the starting point of your website's backend.
// It sets up the server, connects all the routes, and listens for requests.

// --- STEP 1: Import the necessary tools ---
const express = require('express');          // Express makes building web servers in Node.js much easier
const bodyParser = require('body-parser');   // Body Parser helps us read data sent from forms (like login details)
const cors = require('cors');                // CORS allows our frontend to communicate with our backend safely
const path = require('path');                // Path helps us work with file and folder locations easily
const dotenv = require('dotenv');            // Dotenv securely loads our secret variables (like passwords) from the .env file

// Load the secret variables from the .env file into the app
dotenv.config();

// --- STEP 2: Import our custom routes ---
// These files contain the logic for what happens when a user visits a specific URL
const authRoutes = require('./routes/authRoutes');             // Handles Login and Registration
const complaintRoutes = require('./routes/complaintRoutes');   // Handles making and viewing complaints

// Create the actual Express application (This is our server!)
const app = express();
// Decide which port to run on (It checks if Vercel gave us a port, otherwise picks 3000 for local use)
const PORT = process.env.PORT || 3000;

// --- STEP 3: Add Middleware plugins ---
// Middleware are like security guards and helpers that run before processing any request
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Understand JSON data format
app.use(bodyParser.urlencoded({ extended: true })); // Understand standard form data
app.use(express.static(path.join(__dirname, '../public'))); // Serve all our HTML, CSS, and Images from the 'public' folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Make the 'uploads' folder public for images

// --- STEP 4: Define the API Endpoints ---
// When someone goes to '/api/auth...', send them to the authRoutes logic
app.use('/api/auth', authRoutes);
// When someone goes to '/api/complaints...', send them to the complaintRoutes logic
app.use('/api/complaints', complaintRoutes);

// --- STEP 5: main application route ---
// If someone visits the main root path "/", send them to the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- STEP 6: Start the Server ---
// We only want to 'listen' manually if we are running this on our local computer.
// Vercel (our cloud host) will automatically handle listening when in production!
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is happily running on http://localhost:${PORT} 🚀`);
    });
}

// Export the app so Vercel can use it
module.exports = app;
