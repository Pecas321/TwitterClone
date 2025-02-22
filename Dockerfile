FROM python:3.11-alpine

WORKDIR /app

# Instala las dependencias necesarias
RUN apk add --no-cache gcc musl-dev linux-headers

# Copia los archivos de requisitos y la aplicación
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copia el resto de la aplicación
COPY . .

# Expone el puerto que usará la aplicación
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["python", "app.py"]