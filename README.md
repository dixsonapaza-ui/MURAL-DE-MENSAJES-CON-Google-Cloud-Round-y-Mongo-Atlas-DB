# ☁️ Muro de Mensajes API (Cloud Run + MongoDB Atlas)

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![JMeter](https://img.shields.io/badge/Apache_JMeter-D22128?style=for-the-badge&logo=apache&logoColor=white)

Una aplicación web Full-Stack (Backend API REST + Frontend estático) diseñada con arquitectura serverless y alta concurrencia. El proyecto incluye un sistema de registro/login de usuarios y un muro de publicaciones en tiempo real, preparado para soportar cargas de **1,200+ usuarios concurrentes**.

## 🚀 Características Principales

*   **Arquitectura MVC Robusta:** Código altamente escalable dividido en Modelos, Controladores y Rutas.
*   **Autenticación Segura:** Hash de contraseñas con `bcrypt` (Salt Rounds optimizados) y manejo de sesiones con `JSON Web Tokens (JWT)`.
*   **Defensa Rate Limiting:** Escudo anti-spam y protección DDoS mediante `express-rate-limit` (1,500 req/15min).
*   **Manejo de Errores Global:** Control estricto de códigos HTTP (200, 201, 400, 401, 404, 500) y respuestas JSON estructuradas.
*   **Optimización de Base de Datos:** Pool de conexiones pre-configurado (`maxPoolSize: 50`) para maximizar el throughput hacia la capa gratuita de MongoDB Atlas.

## 🛠️ Tecnologías Utilizadas

*   **Backend:** Node.js (v20+), Express.js
*   **Base de Datos:** MongoDB Atlas (M0 Free Tier) + Mongoose
*   **Seguridad:** bcrypt, jsonwebtoken (JWT), cors, express-rate-limit
*   **Frontend:** Vanilla HTML, CSS, JavaScript (Integrado mediante `express.static`)
*   **Pruebas de Estrés:** Apache JMeter (Test Script incluido en el repo)
*   **Despliegue Objetivo:** Google Cloud Run

## 📊 Pruebas de Estrés y Alta Concurrencia

Este proyecto ha sido validado mediante **Apache JMeter**, logrando procesar **1,200 inicios de sesión concurrentes (con encriptación bcrypt activa)** en 10 segundos con **0% de error**, demostrando la capacidad del Pool de Conexiones de Node.js y la eficiencia de MongoDB Atlas.
El archivo de configuración de JMeter (`prueba-jmeter.jmx`) está incluido en la raíz del proyecto para auditorías.

## ⚙️ Instalación y Ejecución Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/dixsonapaza-ui/MURAL-DE-MENSAJES-CON-Google-Cloud-Round-y-Mongo-Atlas-DB.git
    cd MURAL-DE-MENSAJES-CON-Google-Cloud-Round-y-Mongo-Atlas-DB
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Renombra el archivo `.env.example` a `.env` y coloca tus credenciales:
    ```env
    PORT=8080
    MONGO_URI=mongodb+srv://<usuario>:<password>@clusterX.mongodb.net/muro_mensajes
    JWT_SECRET=tu_clave_super_secreta_aqui
    JWT_EXPIRES_IN=24h
    BCRYPT_SALT_ROUNDS=8
    ```

4.  **Iniciar el servidor:**
    ```bash
    npm start
    ```

5.  **Abrir la aplicación:**
    Navega a `http://localhost:8080` en tu navegador.

## ☁️ Diseño para Cloud Run

El proyecto está diseñado desde cero para ejecutarse en contenedores sin estado (Stateless) dentro de **Google Cloud Run**:
*   No utiliza Cluster Module de Node.js, delegando el escalado horizontal nativamente a Cloud Run.
*   El puerto se lee dinámicamente (`process.env.PORT`) para acoplarse al inyector de Google Cloud.
*   Endpoint estático de `/health` implementado para revisiones automáticas de contenedor sano.

---
**Desarrollado para el Milestone del 25% - Estructura Profesional y Despliegue Cloud.**
