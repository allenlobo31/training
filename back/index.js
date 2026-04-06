const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.set('bufferCommands', false);

app.get('/', (req, res) => {
  res.send('Trainer backend is running');
});


const Data = mongoose.model("Todo", {
  text: String,
  completed: Boolean
});

const ensureDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected. Please try again.' });
  }
  next();
};

app.use('/page', ensureDbConnection);




app.post('/page', async (req, res) => {
  try {
    const todo = await Data.create(req.body);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo.', error: error.message });
  }
});





app.get('/page', async (req, res) => {
  try {
    const todos = await Data.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos.', error: error.message });
  }
});



app.put('/page/:id', async (req, res) => {
  try {
    const todo = await Data.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo.', error: error.message });
  }
});



app.delete('/page/:id', async (req, res) => {
  try {
    const deletedTodo = await Data.findByIdAndDelete(req.params.id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo.', error: error.message });
  }
});







const port = process.env.PORT || 3000;

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Add it to back/.env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB Connected');

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();