import express from 'express';
import cors from 'cors';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db.js'; 

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:9000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('Falta JWT_SECRET en las variables de entorno');
  process.exit(1);
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid; 

    const token = jwt.sign(
      { uid },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, uid });
  } catch (error) {
    console.error('Error en login:', error);
    
    let statusCode = 500;
    let errorMessage = 'Error al iniciar sesión';

    switch (error.code) {
      case 'auth/invalid-email':
        statusCode = 400;
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        statusCode = 403;
        errorMessage = 'Usuario deshabilitado';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        statusCode = 401;
        errorMessage = 'Email o contraseña incorrectos';
        break;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const stmt = db.prepare('INSERT INTO usuarios (uid, name, email) VALUES (?, ?, ?)');
    stmt.run(uid, nombre, email);

    const token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      token,
      user: { uid, nombre, email }
    });

  } catch (error) {
    console.error('Error en registro:', error);

    let errorMessage = 'Error al registrar';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email ya registrado';
    } else if (error.message.includes('UNIQUE constraint failed')) {
      errorMessage = 'El usuario ya existe en la base de datos';
    }

    res.status(400).json({ error: errorMessage });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});