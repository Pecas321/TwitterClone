// import express from "express";
// import cors from "cors";
// import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase.js";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";

// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(cookieParser());

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// app.post("/register", async (req, res) => {
//     const { email, password, nombre } = req.body;
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
//         res.status(201).json({ token });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const token = jwt.sign({ uid: userCredential.user.uid }, JWT_SECRET, { expiresIn: '1h' });
//         res.status(200).json({ token });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// const PORT = 4000;
// app.listen(PORT, () => {
//     console.log(`Auth Service corriendo en http://localhost:${PORT}`);
// });

import express from "express";
import cors from "cors";
import { auth, signInWithEmailAndPassword } from "./firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Configuración CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://frontend'],
  credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Falta JWT_SECRET en las variables de entorno");
  process.exit(1);
}

app.post("/auth/login", async (req, res) => {
  console.log("Solicitud de login recibida:", req.body);
  
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    // 1. Autenticar con Firebase
    console.log("Intentando autenticar con Firebase...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential?.user?.uid) {
      throw new Error("Firebase no devolvió un UID válido");
    }

    // 2. Generar token JWT
    console.log("Generando token JWT...");
    const token = jwt.sign(
      { uid: userCredential.user.uid, email: userCredential.user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 3. Responder con éxito
    console.log("Login exitoso para:", email);
    res.status(200).json({
      success: true,
      token: token,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    
    // Manejo específico de errores de Firebase
    let statusCode = 500;
    let errorMessage = "Error en el servidor";

    switch (error.code) {
      case 'auth/invalid-email':
        statusCode = 400;
        errorMessage = "Email inválido";
        break;
      case 'auth/user-disabled':
        statusCode = 403;
        errorMessage = "Usuario deshabilitado";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        statusCode = 401;
        errorMessage = "Email o contraseña incorrectos";
        break;
    }

    res.status(statusCode).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Auth Service listening on http://localhost:${PORT}`);
});