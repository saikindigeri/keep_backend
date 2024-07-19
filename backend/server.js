const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors=require("cors") 
const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key


app.use(cors());

require('dotenv').config()

app.use(express.urlencoded({extended: false}))
app.use(express.json())


const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 

  /* host:'localhost',
  user:'root', 
  password:'',
  database:'youtubedb' */
});
const db = pool.promise();

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user[0].id, username: user[0].username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username: user[0].username });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Example protected route
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}` });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
