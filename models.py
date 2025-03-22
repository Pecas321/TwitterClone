from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuario'  # Especifica el nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    
    # Relaciones
    likes = db.relationship('Like', backref='usuario', lazy=True)
    retweets = db.relationship('Retweet', backref='usuario', lazy=True)
    tweets = db.relationship('Tweet', backref='usuario', lazy=True)

    def __repr__(self):
        return f'Usuario({self.id}, {self.nombre}, {self.email})'


class Tweet(db.Model):
    __tablename__ = 'tweet'  # Especifica el nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(280), nullable=False)
    fecha_publicacion = db.Column(db.DateTime, default=datetime.utcnow)  # Agregado para la fecha de publicación
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    
    # Relaciones
    likes = db.relationship('Like', backref='tweet', lazy=True)
    retweets = db.relationship('Retweet', backref='tweet', lazy=True)

    def __repr__(self):
        return f'Tweet({self.id}, {self.content}, {self.fecha_publicacion}, {self.usuario_id})'


class Like(db.Model):
    __tablename__ = 'like'  # Especifica el nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), nullable=False)

    def __repr__(self):
        return f'Like({self.id}, usuario_id={self.usuario_id}, tweet_id={self.tweet_id})'


class Retweet(db.Model):
    __tablename__ = 'retweet'  # Especifica el nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), nullable=False)
    fecha_retweet = db.Column(db.DateTime, default=datetime.utcnow)  # Agregado para la fecha de retweet

    def __repr__(self):
        return f'Retweet({self.id}, usuario_id={self.usuario_id}, tweet_id={self.tweet_id}, fecha_retweet={self.fecha_retweet})'
    

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)  # ID del usuario que hizo el comentario
    tweet_id = db.Column(db.Integer, nullable=False)     # ID del tweet al que pertenece el comentario
    content = db.Column(db.String(280), nullable=False)  # Contenido del comentario
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # Fecha de creación