const express = require('express');
const { pool } = require("./db/db");
const app = express();
const port = 3002;
const multer = require('multer');
const path = require('path');
const os = require('os'); // Import the os module

const user_app = require("./routes/user_app");
const { authenticateToken } = require("./middlewares/authMiddleware");
const jwt = require("jsonwebtoken");
const { secretKey } = require("./middlewares/config");
const https = require('http');
const httpsServer = https.createServer(/*credentials,*/ app);
app.use(express.json());
app.use(user_app);

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Example route to fetch data from the database
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const sql = 'SELECT * FROM user';  
        const results = await pool.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Function to get local IP address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const interfaceInfo of interfaces[interfaceName]) {
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                return interfaceInfo.address; // Return the first non-internal IPv4 address
            }
        }
    }
    return '127.0.0.1'; // Fallback to localhost if no IP is found
}

// Start the server
httpsServer.listen(port, () => {
    const ip = getLocalIp();
    console.log(`HTTPS Server running on http://${ip}:${port}`);
});
