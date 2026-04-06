const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const Todo = mongoose.model('Todo', {
  text: String,
  completed: Boolean,
});

app.get('/', (req, res) => {
  res.send('Trainer backend is running');
});

app.get('/page', async (req, res) => {
  res.json(await Todo.find());
});

app.post('/page', async (req, res) => {
  res.json(await Todo.create(req.body));
});

app.put('/page/:id', async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/page/:id', async (req, res) => {
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