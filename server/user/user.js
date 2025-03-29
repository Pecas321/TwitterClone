import express from "express";
import cors from "cors";
import { db } from "./firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No autenticado" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token inválido" });
    }
};

app.post("/like", authenticate, async (req, res) => {
    const { tid } = req.body;
    try {
        await db.collection("likes").add({ uid: req.user.uid, tid });
        res.status(201).json({ message: "Like agregado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("Tweet Service funcionando!");
});

const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Like Service corriendo en http://localhost:${PORT}`);
});
