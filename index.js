require('dotenv').config();
const connetToDb = require('./database/db');

const express = require('express');
const app = express();
const port = process.env.PORT || 300;
const cors = require('cors');

app.use(express.json());
app.use(cors());
const User = require('./model/user');

connetToDb();

app.get('/', async (req, res) => {
  const ports = await User.find();
  res.json(ports);
});

app.post('/ins', async (req, res) => {
  const newPort = req.body;

  await User.create(newPort);
  res.status(201).json(newPort);
});
app.put('/ins/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, address } = req.body;
  await User.findByIdAndUpdate(id, {
    name,
    age,
    address,
  });

  res.sendStatus(204);
});
app.delete('/ins/:id', async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);

  res.sendStatus(204);
});

app.listen(port, () => console.log(`🚀 Meu site http://localhost:${port}`));
