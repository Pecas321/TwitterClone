// import express from "express";
// import cors from "cors";
// import { db } from "./firebase.js";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(cors());

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// const authenticate = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "No autenticado" });

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(403).json({ error: "Token inválido" });
//     }
// };

// app.post("/tweet", authenticate, async (req, res) => {
//     const { content, fechaPublicacion } = req.body;
//     try {
//         const tweetRef = await db.collection("tweets").add({
//             content,
//             fecha_publicacion: fechaPublicacion,
//             uid: req.user.uid
//         });
//         res.status(201).json({ message: "Tweet exitoso", tweetId: tweetRef.id });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.get("/tweets", async (req, res) => {
//     try {
//         const tweetsSnapshot = await db.collection("tweets").get();
//         const tweets = [];

//         for (const doc of tweetsSnapshot.docs) {
//             const tweetData = doc.data();
//             const tid = doc.id;
//             const uid = tweetData.uid;

//             const usuarioSnapshot = await db.collection("usuarios").doc(uid).get();
//             const usuarioData = usuarioSnapshot.exists ? usuarioSnapshot.data() : { nombre: "Desconocido" };

//             const likesSnapshot = await db.collection("likes").where("tid", "==", tid).get();
//             const totalLikes = likesSnapshot.size;

//             const fechaOriginal = new Date(tweetData.fecha_publicacion);
//             const fechaFormateada = `${fechaOriginal.getDate().toString().padStart(2, '0')}/${(fechaOriginal.getMonth() + 1).toString().padStart(2, '0')}/${fechaOriginal.getFullYear()}`;

//             tweets.push({
//                 id: doc.id,
//                 content: tweetData.content,
//                 fecha_publicacion: fechaFormateada,
//                 nombre: usuarioData.nombre,
//                 uid: uid,
//                 likes: totalLikes 
//             });
//         }

//         res.status(200).json(tweets);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get("/", (req, res) => {
//     res.send("Tweet Service funcionando!");
// });
  

// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Tweet Service corriendo en http://localhost:${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuración CORS específica
app.use(cors({
  origin: ['http://localhost:8080', 'http://frontend'],
  credentials: true
}));

app.use(express.json());

// Rutas actualizadas
app.get('/tweets', async (req, res) => {
  try {
    const tweetsSnapshot = await db.collection('tweets').get();
    const tweets = [];
    
    for (const doc of tweetsSnapshot.docs) {
        const tweetData = doc.data();
        const tid = doc.id;
        const uid = tweetData.uid;

        const usuarioSnapshot = await db.collection("usuarios").doc(uid).get();
        const usuarioData = usuarioSnapshot.exists ? usuarioSnapshot.data() : { nombre: "Desconocido" };

        const likesSnapshot = await db.collection("likes").where("tid", "==", tid).get();
        const totalLikes = likesSnapshot.size;

        const fechaOriginal = new Date(tweetData.fecha_publicacion);
        const fechaFormateada = `${fechaOriginal.getDate().toString().padStart(2, '0')}/${(fechaOriginal.getMonth() + 1).toString().padStart(2, '0')}/${fechaOriginal.getFullYear()}`;

        tweets.push({
            id: doc.id,
            content: tweetData.content,
            fecha_publicacion: fechaFormateada,
            nombre: usuarioData.nombre,
            uid: uid,
            likes: totalLikes 
        });
    }
        
    
    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tweet', async (req, res) => {
  try {
    const { content, uid } = req.body;
    
    if (!content || !uid) {
      return res.status(400).json({ error: 'Content and UID are required' });
    }
    
    const tweetRef = await db.collection('tweets').add({
      content,
      uid,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ id: tweetRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Tweet service running on port ${PORT}`);
});