const express = require('express');
const { pool } = require("../db/db");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { secretKey } = require("../middlewares/config");
const multer = require('multer');
const path = require('path');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (user[0].password !== password) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user[0].user_id }, secretKey);
        return res.json({ token, user: user[0] });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

router.post('/add-song', upload.single('file'), async (req, res) => {
    const { song_name, artist } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'Please upload a song file.' });
    }

    try {
      
        const file_path = file.path; 

        const query = `INSERT INTO store (song_name, artist, file_path) VALUES (?, ?, ?)`;
        await pool.query(query, [song_name, artist, file_path]);

        return res.status(200).json({ message: 'Song added successfully!' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get('/getstore', async (req, res) => {
    try {
    
        const [store] = await pool.query('SELECT * FROM store');

        return res.status(200).json(store); 
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


module.exports = router;
