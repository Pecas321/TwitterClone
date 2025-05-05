import express from "express";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: ["http://localhost:9000"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:9000'];
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

const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:4000';
const TWEET_SERVICE = process.env.TWEET_SERVICE || 'http://localhost:5000';
const USER_SERVICE = process.env.USER_SERVICE || 'http://localhost:6000';

const proxyOptions = {
  proxyReqPathResolver: (req) => req.url,
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err);
    switch (err && err.code) {
      case 'ECONNRESET':
        return res.status(504).json({ error: 'Servicio no disponible' });
      case 'ECONNREFUSED':
        return res.status(502).json({ error: 'Error de conexión con el servicio' });
      default:
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/register", async (req, res) => {
    try {
        const response = await fetch(`${AUTH_SERVICE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        if (response.ok) {
          res.cookie('token', data.token, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 
          });
            res.status(200).json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const response = await fetch(`${AUTH_SERVICE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.cookie('token', data.token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error en login gateway:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production' 
    });
    res.status(200).json({ message: "Sesión cerrada correctamente" });
});

app.use('/auth', proxy(AUTH_SERVICE, {
  proxyReqPathResolver: (req) => `/auth${req.url}`
}));


app.use('/tweet', proxy(TWEET_SERVICE, {
  proxyReqPathResolver: (req) => `/tweet${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Error en el servicio de tweets' });
  }
})); 

app.use('/tweets', proxy(TWEET_SERVICE, {
  proxyReqPathResolver: (req) => `/tweets${req.url}`, 
  proxyErrorHandler: (err, res, next) => {
    console.error('Error en servicio de tweets:', err);
    res.status(500).json({ error: 'Error al cargar tweets' });
  }
}));

app.use('/like', proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/like${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    console.error('Error en servicio de interacciones:', err);
    res.status(500).json({ error: 'Error en interacciones' });
  }
}));

app.use('/retweet', proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/retweet${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    console.error('Error en servicio de interacciones:', err);
    res.status(500).json({ error: 'Error en interacciones' });
  }
}));

app.use('/stats', proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/stats${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    console.error('Error en servicio de interacciones:', err);
    res.status(500).json({ error: 'Error en interacciones' });
  }
}));

app.get("/", (req, res) => {
    res.redirect("http://frontend");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en http://localhost:${PORT}`);
});
