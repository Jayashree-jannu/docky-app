const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'files.db'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size INTEGER NOT NULL,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// --- USERS TABLE ---
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
)`);

// --- SIGNUP ---
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, username === 'admin' ? 'admin' : 'user'], function(err) {
    if (err) return res.status(400).json({ error: 'User exists' });
    res.json({ success: true });
  });
});

// --- LOGIN ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  });
});

// --- AUTH MIDDLEWARE ---
function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'your_secret_key');
      if (requiredRole && decoded.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// --- FILES TABLE UPDATE ---
db.run(`ALTER TABLE files ADD COLUMN name TEXT`, () => {}); // Add uploader name if not exists

db.run(`ALTER TABLE files ADD COLUMN uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP`, () => {}); // Add upload time if not exists

// --- FILE UPLOAD (with user) ---
app.post('/upload', auth(), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { filename, path: filepath, mimetype, size } = req.file;
  const name = req.user ? req.user.username : req.body.name || 'unknown';
  db.run(
    'INSERT INTO files (filename, path, mimetype, size, name) VALUES (?, ?, ?, ?, ?)',
    [filename, filepath, mimetype, size, name],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, filename, path: filepath, mimetype, size });
    }
  );
});

// --- FILE LIST (admin only) ---
app.get('/files', auth('admin'), (req, res) => {
  db.all('SELECT * FROM files ORDER BY uploaded_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// --- FILE DELETE (admin only) ---
app.delete('/files/:id', auth('admin'), (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM files WHERE id = ?', [id], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'File not found' });
    fs.unlink(file.path, () => {});
    db.run('DELETE FROM files WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

// --- USER LIST (admin only) ---
app.get('/users', auth('admin'), (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 