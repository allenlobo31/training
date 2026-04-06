const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

app.use(cors());
app.use(express.json());

const Todo = mongoose.model('Todo', {
  text: String,
  completed: Boolean,
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/', (req, res) => {
  res.send('Trainer backend is running');
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Simple demo credentials: demo / demo123
  if (username !== 'demo' || password !== 'demo123') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { username } });
});

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { username: req.user.username } });
});

app.get('/page', authMiddleware, async (req, res) => {
  res.json(await Todo.find());
});

app.post('/page', authMiddleware, async (req, res) => {
  res.json(await Todo.create(req.body));
});

app.put('/page/:id', authMiddleware, async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/page/:id', authMiddleware, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

start();