import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'db.db'));


db.prepare(`
  CREATE TABLE IF NOT EXISTS usuarios (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tweets (
    tid INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL,
    content TEXT NOT NULL,
    publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES usuarios(uid)
  )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS like (
      lid INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL,
      tid INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uid) REFERENCES usuarios(uid)
      FOREIGN KEY (tid) REFERENCES tweets(tid)
      UNIQUE (uid, tid) 
    )
  `).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS retweets (
    rid INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL,
    tid INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES usuarios(uid)
    FOREIGN KEY (tid) REFERENCES tweets(tid)
    UNIQUE (uid, tid)
)
`).run();


export default db;