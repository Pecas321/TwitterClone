import express from "express";
import cors from "cors";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Configuración de entorno
dotenv.config();

const app = express();
app.use(express.json());

// CORS configurado para aceptar requests del frontend y otros servicios
app.use(cors({
  origin: ['http://localhost:8080', 'http://frontend', 'http://post-service', 'http://interaction-service'],
  credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET no está definido en .env");
  process.exit(1);
}

// ==================== ENDPOINTS PÚBLICOS ====================

/**
 * @route POST /auth/register
 * @desc Registra un nuevo usuario
 */
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = jwt.sign(
      { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    });
  } catch (error) {
    handleFirebaseError(res, error);
  }
});

/**
 * @route POST /auth/login
 * @desc Autentica un usuario
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = jwt.sign(
      { 
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    });
  } catch (error) {
    handleFirebaseError(res, error);
  }
});

// ==================== ENDPOINT PARA MICROSERVICIOS ====================

/**
 * @route GET /auth/validate-token
 * @desc Valida un token JWT (usado por otros microservicios)
 * @access Private (solo otros servicios)
 */
app.get("/auth/validate-token", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "Token no proporcionado" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificación adicional con Firebase si es necesaria
    // (opcional, para mayor seguridad)
    
    res.status(200).json({ 
      success: true,
      user: decoded 
    });
  } catch (error) {
    res.status(403).json({ 
      success: false,
      error: "Token inválido o expirado" 
    });
  }
});

// ==================== UTILIDADES ====================

/**
 * Maneja errores de Firebase de forma consistente
 */
function handleFirebaseError(res, error) {
  let statusCode = 500;
  let errorMessage = "Error en el servidor";

  switch (error.code) {
    case 'auth/invalid-email':
      statusCode = 400;
      errorMessage = "Email inválido";
      break;
    case 'auth/email-already-in-use':
      statusCode = 409;
      errorMessage = "El email ya está registrado";
      break;
    case 'auth/weak-password':
      statusCode = 400;
      errorMessage = "La contraseña debe tener al menos 6 caracteres";
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      statusCode = 401;
      errorMessage = "Credenciales inválidas";
      break;
  }

  res.status(statusCode).json({ 
    success: false,
    error: errorMessage 
  });
}

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});