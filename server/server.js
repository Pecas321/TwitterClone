import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "./firebase.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


// await db.execute(
//     `CREATE TABLE IF NOT EXISTS usuario (
//     id TEXT PRIMARY KEY UNIQUE,
//     nombre TEXT UNIQUE,
//     email TEXT
//     )`
// );

// await db.execute(
//     `CREATE TABLE IF NOT EXISTS tweet (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     content TEXT,
//     fecha_publicacion DATETIME,
//     uid TEXT,
//     FOREIGN KEY (uid) REFERENCES usuario(id)
//     )`
// );

// await db.execute(
//     `CREATE TABLE IF NOT EXISTS like (
//     id INTEGER PRIMARY KEY UNIQUE,
//     uid TEXT,
//     tid INTEGER,
//     FOREIGN KEY (uid) REFERENCES usuario(id),
//     FOREIGN KEY (tid) REFERENCES Tweet(id)
//     )`
// );

// await db.execute(
//     `CREATE TABLE IF NOT EXISTS retweet (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     fecha_retweet DATETIME,
//     uid TEXT,
//     tid INTEGER,
//     FOREIGN KEY (uid) REFERENCES usuario(id),
//     FOREIGN KEY (tid) REFERENCES Tweet(id)
//     )`
// );

app.post("/register", async (req, res) => {
    const { email, password, nombre } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await db.collection("usuarios").doc(userCredential.user.uid).set({
            nombre,
            email
        });

        const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect("/home");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect("/home");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/tweet", async (req, res) => {
    const { content, fechaPublicacion } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    if (!content || !fechaPublicacion) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const tweetRef = await db.collection("tweets").add({
            content,
            fecha_publicacion: fechaPublicacion,
            uid: decoded.uid
        });

        res.status(201).json({ message: "Tweet exitoso", tweetId: tweetRef.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/tweets", async (req, res) => {
    try {
        const tweetsSnapshot = await db.collection("tweets").get();
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

app.post("/like", async (req, res) => {
    const { tid } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uid = decoded.uid;

        const likeSnapshot = await db.collection("likes")
            .where("uid", "==", uid)
            .where("tid", "==", tid)
            .get();

        if (!likeSnapshot.empty) {
            return res.status(400).json({ error: "Ya diste like a este tweet" });
        }

        await db.collection("likes").add({
            uid,
            tid
        });

        res.status(201).json({ message: "Like agregado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/retweet", async (req, res) => {
    const { tid } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        await db.collection("retweets").add({
            uid: decoded.uid,
            tid: tid
        });

        res.status(201).json({ message: "Retweet agregado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/");
});

app.get("/verify", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ user: decoded });
    } catch (error) {
        res.status(400).json({ error: "Token inválido" });
    }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/login.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"))
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
