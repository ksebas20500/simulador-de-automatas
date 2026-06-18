# 🚀 Simulador de Autómatas Finitos Interactivos

Este proyecto es una herramienta web interactiva diseñada para la configuración, visualización y simulación paso a paso de **Autómatas Finitos Deterministas (DFA)**, **No Deterministas (NFA)** y **Autómatas con Transiciones Vacías (NFA-ε)**.

El sistema cuenta con un diseño dinámico y premium para facilitar el aprendizaje y la experimentación en la teoría de la computación, permitiendo simular cadenas y visualizar los caminos activos en tiempo real a través de un canvas interactivo.

---

## 👥 Desarrolladores
Este proyecto fue desarrollado por los estudiantes:
* **Kevin Sebastian Medina Nava**
* **Wilber Santiago Barajas Cordero**
* **Justin Javier Paez Torres**

---

## 🔬 Enfoque Técnico y Algorítmico

### 1. Representación Formal
El simulador representa formalmente un autómata finito a través de la quíntupla matemática:
$$M = (Q, \Sigma, \delta, q_0, F)$$
* **$Q$**: Conjunto finito de estados.
* **$\Sigma$**: Alfabeto (símbolos permitidos).
* **$\delta$**: Función de transición ($Q \times (\Sigma \cup \{\epsilon\}) \rightarrow \mathcal{P}(Q)$).
* **$q_0$**: Estado inicial ($q_0 \in Q$).
* **$F$**: Conjunto de estados de aceptación ($F \subseteq Q$).

### 2. Algoritmo de Simulación en el Backend
* **Clausura Épsilon ($\epsilon$-closure)**: Se calcula mediante una búsqueda en profundidad (DFS) que recorre las transiciones vacías ($\epsilon$) desde cualquier estado activo actual para resolver todas las rutas posibles sin consumo de caracteres.
* **Tokenización por Coincidencia Máxima (Greedy Matching)**: Para permitir alfabetos cuyos símbolos tengan más de un carácter, el backend ordena el alfabeto de mayor a menor longitud y divide la cadena de entrada en una secuencia de tokens válidos.
* **Historial de Simulación**: El backend retorna un historial detallado que describe en cada paso qué símbolos fueron consumidos, qué estados se activaron y si la cadena se acepta o se rechaza.

### 3. Visualización en el Frontend
* Utiliza **Cytoscape.js** para construir el grafo interactivo.
* Los estados activos, iniciales y de aceptación se colorean y animan para reflejar el estado de la simulación paso a paso.

---

## 🛠️ Estructura del Proyecto

El código está organizado de la siguiente manera:
```text
simulador-de-automatas/
├── firebase.json                   # Configuración del hosting de Firebase
├── .firebaserc                     # Alias del proyecto de Firebase
├── Justificacion_Diseno_Simulador.pdf # PDF de Justificación de Diseño
├── README.md                       # Este archivo informativo
└── public/
    ├── backend/                    # Código del Backend (Python/Flask)
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── app.py                  # Servidor y algoritmos de autómatas
    │   ├── requirements.txt        # Librerías de Python
    │   └── README.md
    └── frontend/                   # Código del Frontend (HTML/CSS/JS)
        ├── css/
        │   └── styles.css
        ├── js/
        │   └── script.js           # Lógica y llamadas al backend
        └── page/
            └── index.html          # Interfaz de usuario interactiva
```

---

## 🐳 Despliegue del Backend (Docker & Render)

El backend cuenta con soporte para Docker, usando `gunicorn` para un entorno de producción óptimo.

### Construir y correr localmente con Docker:
```bash
cd public/backend
docker build -t simulador-backend .
docker run -p 5005:5005 simulador-backend
```

### Para desplegar en **Render**:
1. Crea un nuevo **Web Service** en Render.
2. Conecta el repositorio de GitHub: `https://github.com/ksebas20500/simulador-de-automatas.git`.
3. Selecciona **Docker** como el entorno de ejecución (Runtime).
4. Render utilizará el `Dockerfile` ubicado en `public/backend/Dockerfile`. Configura el subdirectorio de construcción en Render como `public/backend` o apunta directamente la ruta del Dockerfile.
5. El puerto se asignará dinámicamente mediante la variable de entorno `PORT`.

---

## ⚡ Despliegue del Frontend (Firebase Hosting)

El frontend está configurado para desplegarse automáticamente en Firebase Hosting mediante GitHub Actions con cada push a la rama `main`.

### Ejecutar localmente con Firebase:
```bash
# Iniciar sesión en Firebase (si no lo has hecho)
firebase login

# Seleccionar el proyecto
firebase use simulador-de-automatas

# Iniciar servidor local
firebase serve --only hosting
```
El frontend estará disponible localmente en `http://localhost:5000` o la dirección que indique la consola de Firebase.
