const express = require("express");
const router = express.Router();
const Tweet = require("../models/Tweet");

// Crear un nuevo tweet
router.post("/", async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: "userId y content son requeridos" });
    }
    const newTweet = await Tweet.create(userId, content);
    res.status(201).json(newTweet);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el tweet" });
  }
});

// Obtener todos los tweets
router.get("/", async (req, res) => {
  try {
    const tweets = await Tweet.getAll();
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los tweets" });
  }
});

// Eliminar un tweet por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Tweet.delete(id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el tweet" });
  }
});

module.exports = router;
