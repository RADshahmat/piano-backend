const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors'); // Import CORS
const { pool } = require("./db/db");
const app = express();
const port = 3002;
const multer = require('multer');
const path = require('path');
const os = require('os');

const user_app = require("./routes/user_app");
const { authenticateToken } = require("./middlewares/authMiddleware");
const jwt = require("jsonwebtoken");
const { secretKey } = require("./middlewares/config");

app.use(cors()); // Enable CORS for all requests
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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Listen for messages from the Python script
    ws.on('message', (message) => {
        console.log(`Received from Python: ${message}`);

        // Emit the message to all connected WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
                // Emit the message to all connected WebSocket clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send("Piano is Inactive");
                    }
                });
    });
    
});

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const interfaceInfo of interfaces[interfaceName]) {
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                return interfaceInfo.address; 
            }
        }
    }
    return '127.0.0.1'; 
}

// Start the server
server.listen(port, () => {
    const ip = getLocalIp();
    console.log(`HTTP & WebSocket server running on http://${ip}:${port}`);
});
