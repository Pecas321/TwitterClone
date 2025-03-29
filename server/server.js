import path from "path";
import { fileURLToPath } from "url";
// import express from "express";
// import cors from "cors";
// import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "./firebase.js";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(cookieParser());

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


// // await db.execute(
// //     `CREATE TABLE IF NOT EXISTS usuario (
// //     id TEXT PRIMARY KEY UNIQUE,
// //     nombre TEXT UNIQUE,
// //     email TEXT
// //     )`
// // );

// // await db.execute(
// //     `CREATE TABLE IF NOT EXISTS tweet (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     content TEXT,
// //     fecha_publicacion DATETIME,
// //     uid TEXT,
// //     FOREIGN KEY (uid) REFERENCES usuario(id)
// //     )`
// // );

// // await db.execute(
// //     `CREATE TABLE IF NOT EXISTS like (
// //     id INTEGER PRIMARY KEY UNIQUE,
// //     uid TEXT,
// //     tid INTEGER,
// //     FOREIGN KEY (uid) REFERENCES usuario(id),
// //     FOREIGN KEY (tid) REFERENCES Tweet(id)
// //     )`
// // );

// // await db.execute(
// //     `CREATE TABLE IF NOT EXISTS retweet (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     fecha_retweet DATETIME,
// //     uid TEXT,
// //     tid INTEGER,
// //     FOREIGN KEY (uid) REFERENCES usuario(id),
// //     FOREIGN KEY (tid) REFERENCES Tweet(id)
// //     )`
// // );

// app.post("/register", async (req, res) => {
//     const { email, password, nombre } = req.body;

//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
//         await db.collection("usuarios").doc(userCredential.user.uid).set({
//             nombre,
//             email
//         });

//         const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
//         res.cookie('token', token, { httpOnly: true });
//         res.redirect("/home");
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
//         res.cookie('token', token, { httpOnly: true });
//         res.redirect("/home");
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.post("/tweet", async (req, res) => {
//     const { content, fechaPublicacion } = req.body;
//     const token = req.cookies.token;

//     if (!token) {
//         return res.status(401).json({ error: "No autenticado" });
//     }

//     if (!content || !fechaPublicacion) {
//         return res.status(400).json({ error: "Faltan datos requeridos" });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
        
//         const tweetRef = await db.collection("tweets").add({
//             content,
//             fecha_publicacion: fechaPublicacion,
//             uid: decoded.uid
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

// app.post("/like", async (req, res) => {
//     const { tid } = req.body;
//     const token = req.cookies.token;

//     if (!token) {
//         return res.status(401).json({ error: "No autenticado" });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         const uid = decoded.uid;

//         const likeSnapshot = await db.collection("likes")
//             .where("uid", "==", uid)
//             .where("tid", "==", tid)
//             .get();

//         if (!likeSnapshot.empty) {
//             return res.status(400).json({ error: "Ya diste like a este tweet" });
//         }

//         await db.collection("likes").add({
//             uid,
//             tid
//         });

//         res.status(201).json({ message: "Like agregado" });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.post("/retweet", async (req, res) => {
//     const { tid } = req.body;
//     const token = req.cookies.token;

//     if (!token) {
//         return res.status(401).json({ error: "No autenticado" });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
        
//         await db.collection("retweets").add({
//             uid: decoded.uid,
//             tid: tid
//         });

//         res.status(201).json({ message: "Retweet agregado" });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.post("/logout", (req, res) => {
//     res.clearCookie('token');
//     res.redirect("/");
// });

// app.get("/verify", (req, res) => {
//     const token = req.cookies.token;

//     if (!token) {
//         return res.status(401).json({ error: "No autenticado" });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         res.status(200).json({ user: decoded });
//     } catch (error) {
//         res.status(400).json({ error: "Token inválido" });
//     }
// });


// import express from "express";
// import proxy from "express-http-proxy";
// import cookieParser from "cookie-parser";
// import jwt from "jsonwebtoken";
// import cors from "cors";

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // Configuración de CORS
// const corsOptions = {
//     origin: "http://localhost:8080", // Permitir solicitudes desde el frontend
//     credentials: true, // Permitir el envío de cookies
// };

// app.use(cors(corsOptions));

// app.use("/auth", proxy("http://auth-service:4000"));
// app.use("/tweets", proxy("http://tweet-service:5000"));
// app.use("/likes", proxy("http://user-service:6000"));

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// // Middleware para verificar si el usuario está autenticado
// function isAuthenticated(req, res, next) {
//     const token = req.cookies.token;

//     if (!token) {
//         // Si no hay token, redirige al login
//         return res.redirect("/");
//     }

//     try {
//         // Verifica el token JWT
//         jwt.verify(token, JWT_SECRET);
//         next(); // Si el token es válido, continúa con la solicitud
//     } catch (error) {
//         // Si el token es inválido, redirige al login
//         return res.redirect("/");
//     }
// }

// app.post("/register", async (req, res) => {
//     try {
//         const response = await fetch("http://auth-service:4000/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(req.body),
//         });

//         const data = await response.json();
//         if (response.ok) {
//             res.cookie("token", data.token, { httpOnly: true });
//             res.redirect("/home");
//         } else {
//             res.status(response.status).json(data);
//         }
//     } catch (error) {
//         res.status(500).json({ error: "Error al registrar usuario" });
//     }
// });

// app.post("/login", async (req, res) => {
//     try {
//         const response = await fetch("http://auth-service:4000/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(req.body),
//         });

//         const data = await response.json();
//         if (response.ok) {
//             res.cookie("token", data.token, { httpOnly: true });
//             res.redirect("/home");
//         } else {
//             res.status(response.status).json(data);
//         }
//     } catch (error) {
//         res.status(500).json({ error: "Error al iniciar sesión" });
//     }
// });

// app.post("/logout", (req, res) => {
//     // Asegúrate de que las opciones coincidan con las configuraciones de la cookie
//     res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
//     res.status(200).json({ message: "Sesión cerrada correctamente" });
// });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "../client")));

// app.get("/home", (req, res) => {
//     res.redirect("http://frontend-service/home");
// });

// app.get("/", (req, res) => {
//     res.redirect("http://frontend-service/");
// });
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });


import express from "express";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS actualizada
const corsOptions = {
    origin: ["http://localhost:8080", "http://frontend"], // Permitir ambos orígenes
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));

// Middleware para headers CORS
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:8080', 'http://frontend'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

const AUTH_SERVICE = "http://auth-service:4000";
const TWEET_SERVICE = "http://tweet-service:5000";
const USER_SERVICE = "http://user-service:6000";

// Proxies
// Proxies con reescritura de rutas
app.use('/auth', proxy(AUTH_SERVICE, {
    proxyReqPathResolver: (req) => `/auth${req.url}`
  }));
  
  app.use('/api/tweets', proxy(TWEET_SERVICE, {
    proxyReqPathResolver: (req) => `/tweets${req.url}`
  }));
  
  app.use('/api/tweet', proxy(TWEET_SERVICE, {
    proxyReqPathResolver: (req) => `/tweet${req.url}`
  }));
  
  app.use('/api/user', proxy(USER_SERVICE));

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware de autenticación
function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token inválido" });
    }
}




app.post("/register", async (req, res) => {
    try {
        const response = await fetch(`${AUTH_SERVICE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        if (response.ok) {
            res.cookie("token", data.token, { 
                httpOnly: true, 
                sameSite: 'none', 
                secure: true 
            });
            res.status(200).json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

app.post("/login", async (req, res) => {
    console.log("Recibida solicitud de login en gateway");
    
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
      }
  
      const response = await fetch(`${AUTH_SERVICE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error en auth service:", data);
        return res.status(response.status).json(data);
      }
  
      // Configurar cookie segura
      res.cookie("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600000 // 1 hora
      });
  
      res.status(200).json(data);
      
    } catch (error) {
      console.error("Error en gateway:", error);
      res.status(500).json({ 
        error: "Error interno del servidor",
        details: error.message 
      });
    }
  });

app.post("/logout", (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: 'none', 
        secure: true 
    });
    res.status(200).json({ message: "Sesión cerrada correctamente" });
});



app.get("/", (req, res) => {
    res.redirect("http://frontend");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en http://localhost:${PORT}`);
});






