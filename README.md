# Weather App Backend 🌦️

API meteorológica con autenticación JWT, gestión de favoritos y caché. Desarrollada con Node.js, Express y MySQL.

## Características Clave 🔑
- ✅ Autenticación JWT segura
- ✅ Gestión de favoritos por usuario
- ✅ Búsqueda de clima en tiempo real
- ✅ Sistema de caché inteligente (15 min)
- 🔍 Autocompletado de ciudades

## Requisitos 📋
- Node.js v18+
- MySQL 8+
- API Key de [WeatherAPI](https://www.weatherapi.com/)

## Instalación 🚀

1. Clonar repositorio:
```bash
git clone https://github.com/Bustos407/weather_app_backend.git
cd weather-app-backend

#Instalar Dependencias
npm install


##Configurar Variable de Entorno (.env)
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=weather_db
JWT_SECRET=tu_secreto_jwt
WEATHER_API_KEY=tu_api_key
PORT=8080

##Configuracion de la BD
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_user_city (user_id, city),
  CONSTRAINT fk_user_favorites 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


##Iniciar Servidor
npm run dev

## Endpoints Completos 📡
```
### Autenticación 🔐
| Método | Endpoint          | Descripción                     | Ejemplo de Request            |
|--------|-------------------|---------------------------------|--------------------------------|
| POST   | `/auth/register`  | Registrar nuevo usuario         | `{ "username": "user", "password": "pass" }` |
| POST   | `/auth/login`     | Iniciar sesión                  | `{ "username": "user", "password": "pass" }` |

**Respuesta Login Exitoso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```
| Método | Endpoint          | Descripción                     | Ejemplo de Request            |
|--------|-------------------|---------------------------------|--------------------------------|
| GET   | `/weather/{ciudad}`  | Obtener clima por ciudad         | `{ "City": "ciudad y pais", }` |
| GET   | `/weather/autocomplete/{query}`     | Autocompletado de ciudades       | `{"Lon"},` |
| POST   | `/weather/bulk`     | Obtener clima múltiple                 | `{ "cities": ["madrid,es", "london,uk"] }` |

**Respuesta Esperada:**
```json
{
  "city": "Madrid, ES",
  "temperature": {
    "celsius": 22.5,
    "fahrenheit": 72.5
  },
  "humidity": 65,
  "windSpeed": 15.3,
  "condition": "Sunny"
}
```

| Método | Endpoint          | Descripción                     | Requisitos            |
|--------|-------------------|---------------------------------|--------------------------------|
| GET   | `/favorites`  | Obtener favoritos         | `Header: Authorization: Bearer {token}` |
| POST   | `/favorites`     | Añadir favorito       | `Body: { "city": "paris,fr" }` |
| DELETE   | `/favorites/{id}`     | Eliminar favorito                | `Path: ID del favorito` |
| GET   | `/favorites/check`     | Verificar favorito               | `Query: ?city=paris,fr` |
