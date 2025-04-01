import express from 'express';
import cors from 'cors';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:9000', 'http://frontend'],
  credentials: true
}));

app.use(express.json());

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
  
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido' });
    }
  };

app.post('/like', authenticate, async (req, res) => {
    try {
      const { tid } = req.body;
      const { uid } = req.user;
  
      const tweet = db.prepare('SELECT * FROM tweets WHERE tid = ?').get(tid);
      if (!tweet) {
        return res.status(404).json({ error: 'Tweet no encontrado' });
      }
  
      const existingLike = db.prepare('SELECT * FROM like WHERE uid = ? AND tid = ?').get(uid, tid);
      

      db.transaction(() => {
        if (existingLike) {
          db.prepare('DELETE FROM like WHERE lid = ?').run(existingLike.lid);
        } else {
          db.prepare('INSERT INTO like (uid, tid) VALUES (?, ?)').run(uid, tid);
        }
      })();
  
      const newCount = db.prepare('SELECT COUNT(*) as count FROM like WHERE tid = ?')
                        .pluck()
                        .get(tid) || 0;
  
      res.json({ 
        success: true,
        likes: newCount,
        action: existingLike ? 'unliked' : 'liked'
      });
  
    } catch (error) {
      console.error('Error en like:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Error al procesar like',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  });

app.post('/retweet', authenticate, async (req, res) => {
  try {
    const { tid } = req.body;
    const { uid } = req.user;

    const tweet = db.prepare('SELECT * FROM tweets WHERE tid = ?').get(tid);
    const user = db.prepare('SELECT * FROM usuarios WHERE uid = ?').get(uid);
    if (!tweet) return res.status(404).json({ error: 'Tweet no encontrado' });

    const stmt = db.prepare('INSERT INTO retweets (uid, tid) VALUES (?, ?)');
    const info = stmt.run(uid, tid);

    const retweetStmt = db.prepare('INSERT INTO tweets (uid, content) VALUES (?, ?)');
    const retweetInfo = retweetStmt.run(uid, `${tweet.content} RT: ${user.name}`);
    
    res.json({ 
      success: true, 
      newTweetId: info.lastInsertRowid,
      retweetId: retweetInfo.lastInsertRowid, 
      retweets: getRetweetCount(tid)
    });
  } catch (error) {
    console.error('Error en retweet:', error);
    res.status(500).json({ error: 'Error al hacer retweet' });
  }
});

app.get('/stats/:tid', async (req, res) => {
  try {
    const { tid } = req.params;
    res.json({
      like: getLikeCount(tid),
      retweets: getRetweetCount(tid)
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

function getLikeCount(tid) {
  const result = db.prepare('SELECT COUNT(*) as count FROM like WHERE tid = ?').get(tid);
  return result.count;
}

function getRetweetCount(tid) {
  const result = db.prepare('SELECT COUNT(*) as count FROM retweets WHERE tid = ?').get(tid);
  return result.count;
}

app.get('/', (req, res) => {
  res.send('User Interaction Service is running');
});

const PORT = 6000;
app.listen(PORT, () => {
  console.log(`Interaction service running on port ${PORT}`);
});