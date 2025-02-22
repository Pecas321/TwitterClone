# Twitter Clone 🐦

¡Bienvenido al repositorio del proyecto **Twitter Clone**! Este es un clon básico de Twitter desarrollado como parte de un proyecto universitario para la materia de Arquitectura de Software. El objetivo es replicar las funcionalidades principales de Twitter, como publicar tweets, dar likes, hacer retweets y comentar, utilizando una arquitectura monolítica.

---

## **Tabla de Contenidos**
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Instalación y Uso](#instalación-y-uso)
6. [Despliegue con Docker](#despliegue-con-docker)
---

## **Descripción del Proyecto**
Este proyecto es un clon de Twitter que permite a los usuarios:
- Registrarse e iniciar sesión utilizando **Firebase Authentication**.
- Publicar tweets cortos.
- Dar likes y retweets.
- Comentar en tweets.
- Ver un feed de tweets en tiempo real.

El proyecto está desarrollado con una arquitectura monolítica, utilizando **Flask** para el backend, **SQLite** para la base de datos y **Firebase** para la autenticación de usuarios. Además, se utiliza **Docker** para facilitar el despliegue y la ejecución del proyecto.

---

## **Funcionalidades**
- **Autenticación de Usuarios**:
  - Registro e inicio de sesión con correo/contraseña.
  - Inicio de sesión con Google (usando Firebase).
- **Publicación de Tweets**:
  - Los usuarios pueden publicar tweets.
- **Interacciones**:
  - Dar likes a tweets.
  - Hacer retweets.
  - Comentar en tweets.

---

## **Tecnologías Utilizadas**
- **Frontend**:
  - HTML, CSS y JavaScript.
  - Firebase Authentication.
- **Backend**:
  - Flask (Python).
  - SQLite (base de datos).
  - Firebase Admin SDK (verificación de tokens).
- **Herramientas**:
  - Docker (contenedorización).
  - Git (control de versiones).

---

## **Estructura del Proyecto**
El proyecto está organizado de la siguiente manera:
```
TwitterClone/
├── backend/
│ ├── app/
│ │ ├── init.py
│ │ ├── models.py
│ │ ├── routes.py
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── run.py
├── frontend/
│ ├── templates/
│ │ ├── index.html
│ │ ├── login.html
│ │ ├── register.html
├── docker-compose.yml
├── README.md
├── database.db
├── seeder.py
```

---

## Instalación y Uso
Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### Requisitos
- Python 3.10 o superior.
- Docker y Docker Compose.
- Cuenta de Firebase (para la autenticación).

### Pasos
1. Clona el repositorio:
```
git clone https://github.com/Pecas321/TwitterClone.git
cd TwitterClone
```

2. Configura Firebase:
- Crea un proyecto en Firebase Console.
- Habilita la autenticación con correo/contraseña y Google.
- Obtén las credenciales de Firebase y configura el archivo `index.html`.

3. Instala las dependencias:
```
pip install -r backend/requirements.txt
```

4. Ejecuta el seeder para crear la base de datos:
```
python seeder.py
```

5. Levanta los contenedores con Docker Compose:
```
docker-compose up --build
```

6. Abre tu navegador y visita:  
http://localhost:8000

---

## Despliegue con Docker
El proyecto está configurado para ejecutarse en contenedores Docker. Simplemente sigue estos pasos:

1. Asegúrate de tener Docker y Docker Compose instalados.
2. Ejecuta:
```
docker-compose up --build
```
3. Accede a la aplicación en:  
http://localhost:8000

---

## Contacto
Si tienes alguna pregunta o sugerencia, no dudes en contactarnos:
- Nombres: Jonatan, Daniel Salinas, Brayan Castelblanco
- Correo: danielc.salinasr@utadeo.edu.co
- GitHub: Pecas321

---

¡Gracias por visitar el repositorio! Esperamos que este proyecto te sea útil. 🚀

---

### Capturas de Pantalla 

