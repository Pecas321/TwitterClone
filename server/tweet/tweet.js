import express from 'express';
import cors from 'cors';
import db from '../db.js'; 
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:9000', 'http://frontend'],
  credentials: true
}));

app.use(express.json());

app.get('/tweets', (req, res) => {
  try {
    const query = `
      SELECT 
        t.tid,
        t.content,
        t.publicacion,
        u.uid as user_uid,
        u.name as user_name,
        u.email as user_email
      FROM tweets t
      JOIN usuarios u ON t.uid = u.uid
      ORDER BY t.publicacion DESC
    `;

    const tweets = db.prepare(query).all();
    res.status(200).json(tweets);

  } catch (error) {
    console.error('Error al obtener tweets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/tweet', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const uid = decoded.uid;

    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido del tweet no puede estar vacío' });
    }

    const stmt = db.prepare(`
      INSERT INTO tweets (uid, content) 
      VALUES (?, ?)
    `);
    stmt.run(uid, content);

    res.status(201).json({
      success: true,
      message: 'Tweet creado exitosamente',
    });

  } catch (error) {
    console.error('Error al crear tweet:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    res.status(500).json({ 
      error: 'Error interno del servidor al crear tweet',
      details: error.message 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Tweet service running on port ${PORT}`);
});