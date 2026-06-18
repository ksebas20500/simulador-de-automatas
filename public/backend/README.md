# 🚀 Backend Python - Simulador de Autómatas Finitos

Este es el backend del simulador de autómatas, encargado de procesar la lógica matemática detrás de la simulación de Autómatas Finitos Deterministas (**DFA**) y No Deterministas (**NFA**). Está construido utilizando Python, ofreciendo un servicio de simulación paso a paso a través de una API REST ágil y ligera.

---

## 📚 Documentación de Librerías Utilizadas

A continuación se detallan las librerías empleadas en `app.py`, clasificadas por tipo, propósito en la aplicación e instrucciones de instalación.

| Librería / Módulo | Tipo | Enlace Oficial / Referencia | Propósito en el Backend |
| :--- | :--- | :--- | :--- |
| **Flask** | Externa | [Flask Docs](https://flask.palletsprojects.com/) | Framework web encargado de montar el servidor HTTP, gestionar peticiones (`request`) y formatear respuestas JSON (`jsonify`). |
| **Flask-CORS** | Externa | [Flask-CORS Docs](https://flask-cors.readthedocs.io/) | Permite habilitar CORS (Cross-Origin Resource Sharing) para que la aplicación frontend pueda comunicarse de forma segura con la API del backend. |
| **typing** | Estándar (Nativa) | [Python typing](https://docs.python.org/3/library/typing.html) | Proporciona soporte para "Type Hints" (indicaciones de tipo) como `List`, `Set`, `Dict`, y `Any` para facilitar el análisis estático y la robustez del código. |

---

### 1. 🌶️ Flask (Librería Externa)
* **¿Qué es?** Un micro-framework web de Python sumamente rápido, simple de utilizar y con un núcleo minimalista pero extensible.
* **Uso específico en el código (`app.py`):**
  * `from flask import Flask, request, jsonify` (Línea 1)
  * Se inicializa la aplicación con `app = Flask(__name__)` (Línea 5).
  * Se define el endpoint `/simulate` utilizando `@app.route('/simulate', methods=['POST'])` (Línea 72) para recibir la estructura JSON del autómata mediante `request.json` (Línea 74).
  * Devuelve los resultados de la simulación estructurados y listos para el cliente usando `jsonify(...)` (Líneas 88 y 94).
* **Comando de Instalación:**
  ```bash
  pip install Flask
  ```

### 2. 🛡️ Flask-CORS (Librería Externa)
* **¿Qué es?** Una extensión para Flask que maneja el intercambio de recursos de origen cruzado (CORS), haciendo posible el consumo de APIs inter-dominio.
* **Uso específico en el código (`app.py`):**
  * `from flask_cors import CORS` (Línea 2)
  * Se aplica globalmente al instanciar el servidor mediante `CORS(app)` (Línea 6). Esto permite que el frontend web (habitualmente alojado en otro host o puerto como `localhost:5173` o `localhost:3000`) pueda consumir la API del backend sin restricciones del navegador.
* **Comando de Instalación:**
  ```bash
  pip install Flask-CORS
  ```

### 3. 🎯 typing (Biblioteca Estándar de Python)
* **¿Qué es?** Un módulo nativo de la biblioteca estándar de Python (introducido desde Python 3.5) que permite especificar anotaciones de tipos para variables y firmas de funciones.
* **Uso específico en el código (`app.py`):**
  * `from typing import List, Set, Dict, Any` (Línea 3)
  * Se usa en la firma de inicialización y métodos de la clase `FiniteAutomaton`:
    ```python
    def __init__(self, states: List[str], alphabet: List[str], transitions: List[Dict[str, Any]], initial_state: str, final_states: List[str]):
    ```
  * Permite que editores de código (como VS Code / Gemini) ofrezcan autocompletado inteligente y realicen análisis estático de errores antes de la ejecución del código.
* **Comando de Instalación:**
  * **Ninguno.** Al ser nativo de Python, no requiere instalación por `pip`.

---

## 🛠️ Guía de Configuración y Despliegue Local

Sigue estos pasos para configurar el entorno virtual e instalar las librerías necesarias para correr el backend.

### Paso 1: Crear un entorno virtual (Recomendado)
Es una buena práctica crear un entorno virtual para aislar las dependencias del proyecto:

```bash
# Crear entorno virtual llamado 'venv'
python3 -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate

# En Windows (PowerShell):
# venv\Scripts\Activate.ps1
```

### Paso 2: Instalar las dependencias
Usa el archivo `requirements.txt` creado para instalar Flask y Flask-CORS de una sola vez:

```bash
pip install -r requirements.txt
```

### Paso 3: Ejecutar el Servidor
Inicia la ejecución del backend con Python:

```bash
python app.py
```

El backend se iniciará y estará escuchando peticiones en:
```text
http://127.0.0.1:5005
```

---

## 🔌 Referencia de la API: `/simulate`

El backend expone un único endpoint para simular autómatas:

* **URL:** `/simulate`
* **Método:** `POST`
* **Cabecera (Headers):** `Content-Type: application/json`

### Ejemplo de Payload (Request Body):
```json
{
  "states": ["q0", "q1", "q2"],
  "alphabet": ["0", "1"],
  "transitions": [
    { "from": "q0", "symbol": "0", "to": "q0" },
    { "from": "q0", "symbol": "1", "to": "q1" },
    { "from": "q1", "symbol": "0", "to": "q2" },
    { "from": "q1", "symbol": "1", "to": "q1" }
  ],
  "initial_state": "q0",
  "final_states": ["q2"],
  "input_string": "010"
}
```

### Ejemplo de Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "accepted": true,
  "history": [
    {
      "active_states": ["q0"],
      "symbol": null,
      "accepted": false
    },
    {
      "active_states": ["q0"],
      "symbol": "0",
      "accepted": false
    },
    {
      "active_states": ["q1"],
      "symbol": "1",
      "accepted": false
    },
    {
      "active_states": ["q2"],
      "symbol": "0",
      "accepted": true
    }
  ]
}
```
