import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { db } from './firebase.js';
import dotenv from 'dotenv';

// Configuración inicial
dotenv.config();
const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:8080', 'http://frontend', 'http://auth-service'],
  credentials: true
}));
app.use(express.json());

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
/**
 * Valida el token JWT llamando al auth-service
 */
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    // Llamada al auth-service para validar el token
    const response = await axios.get('http://auth-service:4000/auth/validate-token', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.success) {
      throw new Error('Token inválido');
    }

    req.user = response.data.user; // Guarda los datos del usuario
    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// ==================== ENDPOINTS ====================

/**
 * @route POST /tweets
 * @desc Crea un nuevo tweet (protegido)
 */
app.post('/tweets', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const { uid, email } = req.user; // Obtenido del auth-service

    if (!content || content.length > 280) {
      return res.status(400).json({ error: 'El contenido debe tener entre 1 y 280 caracteres' });
    }

    const tweetRef = await db.collection('tweets').add({
      content,
      uid,
      email,
      createdAt: new Date().toISOString(),
      likes: 0
    });

    res.status(201).json({
      id: tweetRef.id,
      content,
      user: { uid, email }
    });
  } catch (error) {
    console.error('Error al crear tweet:', error);
    res.status(500).json({ error: 'Error al crear el tweet' });
  }
});

/**
 * @route GET /tweets
 * @desc Obtiene todos los tweets con sus metadatos
 */
app.get('/tweets', async (req, res) => {
  try {
    const tweetsSnapshot = await db.collection('tweets')
      .orderBy('createdAt', 'desc')
      .get();

    const tweets = await Promise.all(
      tweetsSnapshot.docs.map(async (doc) => {
        const tweetData = doc.data();
        
        // Obtener información del usuario (podría cachearse)
        const userSnapshot = await db.collection('users').doc(tweetData.uid).get();
        const userData = userSnapshot.data() || { name: 'Usuario desconocido' };

        return {
          id: doc.id,
          content: tweetData.content,
          createdAt: formatDate(tweetData.createdAt),
          user: {
            uid: tweetData.uid,
            name: userData.name,
            email: tweetData.email
          },
          likes: tweetData.likes || 0
        };
      })
    );

    res.status(200).json(tweets);
  } catch (error) {
    console.error('Error al obtener tweets:', error);
    res.status(500).json({ error: 'Error al obtener tweets' });
  }
});

// ==================== UTILIDADES ====================

/**
 * Formatea la fecha para mostrarla
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.TWEET_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Tweet Service running on http://localhost:${PORT}`);
});