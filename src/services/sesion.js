// Almacén de la sesión en el navegador (localStorage), para que sobreviva a las recargas de página.
// Guarda: access token (corta duración), refresh token (para renovarlo) y los datos del usuario.
// Otros módulos pueden suscribirse para enterarse cuando la sesión cambia (login, logout, token vencido).

const CLAVE_TOKEN = 'token';
const CLAVE_REFRESH = 'refreshToken';
const CLAVE_USUARIO = 'usuarioSesion';

const oyentes = new Set();
const avisar = () => oyentes.forEach((fn) => fn());

export const suscribirSesion = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};

export const leerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const leerRefreshToken = () => localStorage.getItem(CLAVE_REFRESH);

export const leerUsuario = () => {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null; // dato corrupto: se trata como sin sesión
  }
};

// Respuesta del login: { token, refreshToken, usuario }
export const guardarSesion = ({ token, refreshToken, usuario }) => {
  localStorage.setItem(CLAVE_TOKEN, token);
  if (refreshToken) localStorage.setItem(CLAVE_REFRESH, refreshToken);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  avisar();
};

// Tras renovar: solo cambian los tokens
export const actualizarTokens = ({ token, refreshToken }) => {
  localStorage.setItem(CLAVE_TOKEN, token);
  if (refreshToken) localStorage.setItem(CLAVE_REFRESH, refreshToken);
};

// Tras revalidar con /auth/me: el servidor es la fuente de verdad del rol y los datos
export const actualizarUsuario = (usuario) => {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  avisar();
};

export const limpiarSesion = () => {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_REFRESH);
  localStorage.removeItem(CLAVE_USUARIO);
  avisar();
};
