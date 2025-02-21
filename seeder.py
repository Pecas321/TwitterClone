import sqlite3 as sql

DATABASE = "C:\\Users\\jonat\\Downloads\\Proyecto_Arq\\TwitterClone\\database.db"

def create_db():
    conn = sql.connect(DATABASE)
    cur = conn.cursor()
    
    # Crear tabla usuario
    cur.execute("""CREATE TABLE IF NOT EXISTS usuario (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL, 
                    email TEXT NOT NULL UNIQUE, 
                    contraseña TEXT NOT NULL
                )""")
    
    # Crear tabla tweet
    cur.execute("""CREATE TABLE IF NOT EXISTS tweet (
                    tweet_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contenido TEXT NOT NULL,
                    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES usuario(user_id)
                )""")
    
    # Crear tabla comentario
    cur.execute("""CREATE TABLE IF NOT EXISTS comentario (
                    comentario_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contenido TEXT NOT NULL,
                    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER,
                    tweet_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES usuario(user_id),
                    FOREIGN KEY (tweet_id) REFERENCES tweet(tweet_id)
                )""")
    
    conn.commit()
    conn.close()

def addValues():
    conn = sql.connect(DATABASE)
    cur = conn.cursor()
    data = [('John', 'john@email.com', '123456'),
            ('Sally', 'sally@email.com', '123456'),
            ('Tom', 'tom@email.com', '123456')]
    cur.executemany("""
        INSERT INTO usuario (nombre, email, contraseña) 
        VALUES (?, ?, ?)
    """, data)
    conn.commit()
    conn.close()
if __name__ == "__main__":
    create_db()
    addValues()