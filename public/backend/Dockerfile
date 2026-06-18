FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Puerto por defecto de Render o 5005 local
ENV PORT=5005
EXPOSE 5005

# Ejecutar con gunicorn en producción
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} app:app"]
