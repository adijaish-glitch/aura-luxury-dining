const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
// Serve static files to prevent CORS issues if opened via file:// or another port
app.use(express.static(__dirname));

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// ---------------------------
// REST API ENDPOINTS
// ---------------------------

// Create a new Booking (Open constraint, from landing page)
app.post('/api/bookings', (req, res) => {
    const { name, email, date, time, requests } = req.body;
    
    if (!name || !email || !date || !time) {
        return res.status(400).json({ error: 'Missing required reservation fields.' });
    }

    try {
        const dbData = fs.readFileSync(DB_FILE, 'utf8');
        const bookings = JSON.parse(dbData);
        
        const newBooking = {
            id: Date.now().toString(),
            name,
            email,
            date,
            time,
            requests: requests || "None",
            status: "Pending",
            timestamp: new Date().toISOString()
        };
        
        bookings.push(newBooking);
        fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2));
        
        res.status(201).json({ message: 'Reservation created successfully!', booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save booking to database.' });
    }
});

// Admin Login Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded simple authentication
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'aura-super-secret-admin-token' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
});

// Get Live Bookings (Protected Endpoint for Admin)
app.get('/api/bookings', (req, res) => {
    const authHeader = req.headers['authorization'];
    
    // Check for our dummy token
    if (authHeader !== 'Bearer aura-super-secret-admin-token') {
        return res.status(403).json({ error: 'Unauthorized access. Please log in as admin.' });
    }

    try {
        const dbData = fs.readFileSync(DB_FILE, 'utf8');
        const bookings = JSON.parse(dbData);
        // Reverse array to show newest bookings first
        res.json(bookings.reverse());
    } catch (err) {
        res.status(500).json({ error: 'Failed to read database.' });
    }
});

// Update Booking Status (Protected Endpoint)
app.patch('/api/bookings/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer aura-super-secret-admin-token') {
        return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { status } = req.body;
    try {
        const bookings = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const index = bookings.findIndex(b => b.id === req.params.id);
        
        if (index !== -1) {
            bookings[index].status = status;
            fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2));
            res.json({ message: 'Booking updated.', booking: bookings[index] });
        } else {
            res.status(404).json({ error: 'Booking not found.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update database.' });
    }
});

app.listen(PORT, () => {
    console.log(`[AURA Backend] Server running at http://localhost:${PORT}`);
});
