const { db } = require("../firebase"); // Importa la conexión con Firebase

class Tweet {
  constructor(id, userId, content, timestamp) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.timestamp = timestamp;
  }

  // Guardar un nuevo tweet en Firestore
  static async create(userId, content) {
    try {
      const tweetData = {
        userId,
        content,
        timestamp: new Date(),
      };
      const docRef = await db.collection("tweets").add(tweetData);
      return { id: docRef.id, ...tweetData };
    } catch (error) {
      console.error("Error al crear tweet:", error);
      throw error;
    }
  }

  // Obtener todos los tweets
  static async getAll() {
    try {
      const snapshot = await db.collection("tweets").orderBy("timestamp", "desc").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error al obtener tweets:", error);
      throw error;
    }
  }

  // Eliminar un tweet por ID
  static async delete(id) {
    try {
      await db.collection("tweets").doc(id).delete();
      return { message: "Tweet eliminado correctamente" };
    } catch (error) {
      console.error("Error al eliminar tweet:", error);
      throw error;
    }
  }
}

module.exports = Tweet;