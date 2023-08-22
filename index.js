/* Imports */
require('dotenv').config();
const connetToDb = require('./database/db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();
const port = process.env.PORT || 322;

app.use(express.json());
app.use(cors());
const Agenda = require('./model/scheduling');
const Login = require('./model/login');

connetToDb();

// Open routes
app.get('/', async (req, res) => {
  const users = await Agenda.find();
  res.json(users);
});

app.post('/ins', async (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    return res.status(422).json({
      message: 'name is required',
    });
  }
  // Verificação de CPF
  const cpfExists = await Agenda.findOne({ cpf: newUser.cpf });

  if (cpfExists) {
    return res.status(422).json({
      message: 'CPF já cadastrado',
    });
  }

  await Agenda.create(newUser);
  return res.status(201).json(newUser);
});
app.put('/ins/:id', async (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;
  await Agenda.findByIdAndUpdate(id, updateUser);

  res.sendStatus(204);
});
app.delete('/ins/:id', async (req, res) => {
  const { id } = req.params;
  await Agenda.findByIdAndDelete(id);

  res.sendStatus(204);
});

// --------------------------- Login ----------------------------

app.get('/loginusers/all', async (req, res) => {
  const users = await Login.find();
  res.json(users);
});

// Private Route

app.get('/user/:id', checkToken, async (req, res) => {
  const { id } = req.params;

  const user = await Login.findById(id, '-password');

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.status(200).json(user);
  //feito
});

function checkToken(req, res, next) {
  const authReader = req.headers['authorization'];
  const token = authReader && authReader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
}

app.post('/register/user', async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await Login.findOne({ email });
  if (userExists) {
    return res.status(422).json({ message: 'Email já cadastrado!' });
  }

  if (!name) {
    return res.status(422).json({ message: 'O Nome é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(422).json({
      message: 'O Nome é deve ter pelo menos três caracteres',
    });
  }
  if (!email) {
    return res.status(422).json({ message: 'O email é obrigatório' });
  }
  if (!password) {
    return res.status(422).json({ message: 'A senha é obrigatória' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  await Login.create({
    name,
    email,
    password: passwordHash,
  });
  res.status(201).json({ name, email, password });
});
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ message: 'O email é obrigatório' });
  }
  if (!password) {
    return res.status(422).json({ message: 'A senha é obrigatória' });
  }

  const user = await Login.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(404).json({
      message: 'Senha inválida',
    });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);

    res.status(200).json({
      message: 'Autenticação realizada com sucesso!',
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erro no servidor, tente novamente' });
  }
});
app.put('/login/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  await Login.findByIdAndUpdate(id, {
    name,
    email,
    password: passwordHash,
  });

  res.sendStatus(204);
});
app.delete('/login/user/:id', async (req, res) => {
  const { id } = req.params;
  await Login.findByIdAndDelete(id);

  res.sendStatus(204);
});

app.listen(port, () => console.log(`🚀 Meu site http://localhost:${port}`));
