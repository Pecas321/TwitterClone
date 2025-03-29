import express from "express";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuración inicial
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==================== CONFIGURACIÓN BÁSICA ====================
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/dist")));

// URLs de los microservicios
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || "http://auth-service:4000",
  tweet: process.env.TWEET_SERVICE_URL || "http://tweet-service:5000",
  user: process.env.USER_SERVICE_URL || "http://user-service:6000"
};

// ==================== CONFIGURACIÓN CORS ====================
const CORS_OPTIONS = {
    origin: [
      "http://localhost:8080",  // Desarrollo
      "http://frontend"         // Docker
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  };
  
  app.use(cors(CORS_OPTIONS));

// Middleware CORS adicional para headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Expose-Headers", "Set-Cookie");
  next();
});

// ==================== MIDDLEWARES ====================
/**
 * Verifica el token JWT en cookies o headers
 */
const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(403).json({ error: "Token inválido" });
  }
};

// ==================== PROXIES A MICROSERVICIOS ====================
app.use("/auth", proxy(SERVICES.auth, {
  proxyReqPathResolver: (req) => `/auth${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    console.error("Error en Auth Service:", err);
    res.status(502).json({ error: "Error en servicio de autenticación" });
  }
}));

app.use("/api/tweets", authenticate, proxy(SERVICES.tweet, {
  proxyReqPathResolver: (req) => `/tweets${req.url}`,
  proxyReqOptDecorator: (options, srcReq) => {
    // Inyectar headers de autenticación
    options.headers = {
      ...options.headers,
      "X-User-Id": srcReq.user.uid,
      "X-User-Email": srcReq.user.email
    };
    return options;
  }
}));

app.use("/api/users", authenticate, proxy(SERVICES.user));

// ==================== ENDPOINTS DEL GATEWAY ====================

/**
 * @route POST /register
 * @desc Registro de usuarios
 */
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const response = await fetch(`${SERVICES.auth}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Configurar cookie segura
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hora
    });

    res.status(201).json(data);
  } catch (error) {
    console.error("Gateway Register Error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @route POST /login
 * @desc Autenticación de usuarios
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await fetch(`${SERVICES.auth}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Gateway Login Error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @route POST /logout
 * @desc Cierre de sesión
 */
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.status(204).end();
});

/**
 * @route GET /health
 * @desc Health check del gateway
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    services: Object.keys(SERVICES)
  });
});

// ==================== MANEJO DE ERRORES ====================
app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 API Gateway ejecutándose en http://localhost:${PORT}
  🔗 Servicios:
  - Auth: ${SERVICES.auth}
  - Tweet: ${SERVICES.tweet}
  - User: ${SERVICES.user}
  `);
});