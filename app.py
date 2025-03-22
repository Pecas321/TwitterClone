from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import pyrebase
import redis
import os
from datetime import datetime
from models import db, Usuario, Tweet, Like, Retweet, Comment

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

# Cambia la URI de la base de datos para que apunte al archivo en el volumen
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data/database.db'
app.config['SECRET_KEY'] = 'your_secret_key'
db.init_app(app)

config = {
    "apiKey": "AIzaSyACR2t6OiZCAyTqaVNeZ2AvexdjOgr6x3k",
    "authDomain": "twitter-rr.firebaseapp.com",
    "projectId": "twitter-rr",
    "storageBucket": "twitter-rr.appspot.com",
    "messagingSenderId": "765127778502",
    "appId": "1:765127778502:web:70b88c756c89e6b47fb7c7",
    "measurementId": "G-2FPEM0CLX3",
    "databaseURL": ""
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

@app.before_request
def require_login():
    if 'user' not in session and request.endpoint not in ['login', 'signup']:
        return redirect(url_for('login'))

@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            session['user'] = user['localId']
            flash('Login successful!', 'success')
            return redirect('/')
        except Exception as e:
            flash('Invalid credentials. Please try again.', 'danger')
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/registro', methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        nombre = request.form['name']
        email = request.form['email']
        password = request.form['password']
        if not nombre or not email or not password:
            flash('All fields are required!', 'danger')
            return redirect(url_for('signup'))
        try:
            user = auth.create_user_with_email_and_password(email, password)
            new_user = Usuario(id=user['localId'], nombre=nombre, email=email, password=password)
            db.session.add(new_user)
            db.session.commit()
            session['user'] = user['localId']
            flash('Registration successful!', 'success')
            return redirect('/')
        except Exception as e:
            flash(str(e), 'danger')
            return redirect(url_for('signup'))
    return render_template('signup.html')

@app.route('/', methods=['GET'])
def home():
    tweets = Tweet.query.order_by(Tweet.fecha_publicacion.desc()).all()
    return render_template('index.html', tweets=tweets)

@app.route('/like/<int:tweet_id>', methods=['POST'])
def like(tweet_id):
    user_id = session['user']
    like = Like.query.filter_by(usuario_id=user_id, tweet_id=tweet_id).first()
    if like:
        db.session.delete(like)
        flash('Like removed!', 'info')
    else:
        new_like = Like(usuario_id=user_id, tweet_id=tweet_id)
        db.session.add(new_like)
        flash('Tweet liked!', 'success')
    db.session.commit()
    return redirect(url_for('home'))

@app.route('/retweet/<int:tweet_id>', methods=['POST'])
def retweet(tweet_id):
    user_id = session['user']
    retweet = Retweet.query.filter_by(usuario_id=user_id, tweet_id=tweet_id).first()
    if not retweet:
        new_retweet = Retweet(usuario_id=user_id, tweet_id=tweet_id)
        db.session.add(new_retweet)
        db.session.commit()
        flash('Tweet retweeted!', 'success')
    else:
        flash('You have already retweeted this tweet!', 'info')
    return redirect(url_for('home'))

# Nueva ruta para crear un comentario
@app.route('/comment', methods=['POST'])
def create_comment():
    if 'user' not in session:
        return jsonify({'message': 'Usuario no autenticado'}), 401

    data = request.get_json()
    user_id = session['user']
    tweet_id = data.get('tweet_id')
    content = data.get('content')

    if not tweet_id or not content:
        return jsonify({'message': 'Faltan datos'}), 400

    new_comment = Comment(user_id=user_id, tweet_id=tweet_id, content=content)
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({'message': 'Comentario creado', 'comment_id': new_comment.id}), 201

# Nueva ruta para obtener comentarios de un tweet
@app.route('/comments/<int:tweet_id>', methods=['GET'])
def get_comments(tweet_id):
    comments = Comment.query.filter_by(tweet_id=tweet_id).all()
    comments_data = [{
        'id': comment.id,
        'user_id': comment.user_id,
        'content': comment.content,
        'created_at': comment.created_at
    } for comment in comments]

    return jsonify({'comments': comments_data}), 200

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('You have been logged out.', 'info')
    return redirect('/login')

@app.route('/check_tables')
def check_tables():
    tables = db.engine.table_names()
    return f'Tables in database: {tables}'

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)