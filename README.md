# MusicMania – Frontend

Interfaz de la tienda MusicMania. React + Vite, con Bootstrap y React Router.
Consume la API REST del backend: https://github.com/jonathan-gaona/MusicMania-backend (Spring Boot).

## Cómo ejecutarlo

1. Levanta primero el backend (ver su README) en http://localhost:4000
2. Requisitos: Node.js 22
3. En esta carpeta:
   npm install
   cp .env.example .env (en Windows: copy .env.example .env)
   npm run dev
4. Asegúrate de tener configurado el Client ID de Google en tu archivo .env:
   VITE_GOOGLE_CLIENT_ID=628040031489-fo67bh0qm14tq7t9ec7fo46hn6t52kam.apps.googleusercontent.com
5. Abre http://localhost:5173

Variable de entorno: `VITE_API_URL` (por defecto http://localhost:4000/api)

## Integración con la API

- `src/api/axios.js`: cliente HTTP. Adjunta el JWT a cada petición y renueva el token automáticamente.
- `src/services/`: un módulo por recurso (auth, productos, órdenes, usuarios).

## Gestión de sesión

- `src/services/sesion.js`: guarda token, refresh token y usuario en localStorage (la sesión sobrevive a recargas).
- `src/context/AuthContext.jsx`: expone el usuario y su rol a toda la app. Al recargar valida la sesión con `/api/auth/me`.
  -Inicio de sesión / Registro con Google: Disponible en `/iniciar-sesion` y `/registro` mediante `@react-oauth/google` .Envía la credencial a POST `/api/auth/google` y guarda la sesión recibida.
- Renovación: si el servidor responde 401, `axios.js` usa el refresh token, obtiene un token nuevo y repite la petición; si no puede, cierra la sesión.

## Restricciones de acceso

- `src/components/ProtectedRoute.jsx`: protege rutas por sesión y por rol.
  - `/admin`: solo rol Administrador (un Cliente ve "403").
  - `/mis-compras`: cualquier usuario con sesión.
- El Navbar muestra "Panel Admin" y "Mis compras" según el rol.
- La seguridad real la impone el backend (401 sin token, 403 sin el rol).

## Pruebas

npm test
