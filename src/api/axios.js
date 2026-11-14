import axios from 'axios';
import { leerToken, leerRefreshToken, actualizarTokens, limpiarSesion } from '../services/sesion';

// La URL del backend se configura en frontend/.env (VITE_API_URL)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL });

// Cliente sin interceptores, solo para renovar el token (evita bucles infinitos)
const clienteRefresh = axios.create({ baseURL });

// 1. Adjunta el access token a cada petición
api.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si varias peticiones fallan a la vez por token vencido, se renueva una sola vez y todas esperan el resultado
let renovando = null;

const renovarToken = () => {
  if (!renovando) {
    renovando = clienteRefresh
      .post('/auth/refresh', { refreshToken: leerRefreshToken() })
      .then(({ data }) => {
        actualizarTokens(data);
        return data.token;
      })
      .finally(() => {
        renovando = null;
      });
  }
  return renovando;
};

const esRutaDeAutenticacion = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

// 2. Si el servidor responde 401 (token vencido), intenta renovarlo y repite la petición.
//    Si no se puede renovar, cierra la sesión local.
api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !esRutaDeAutenticacion(original.url)) {
      if (leerRefreshToken() && !original._reintentado) {
        original._reintentado = true;
        try {
          const nuevoToken = await renovarToken();
          original.headers.Authorization = `Bearer ${nuevoToken}`;
          return api(original);
        } catch {
          limpiarSesion();
        }
      } else if (leerToken()) {
        limpiarSesion();
      }
    }
    return Promise.reject(error);
  }
);

export const mensajeError = (error, porDefecto = 'Ocurrió un error. Intenta nuevamente.') =>
  error?.response?.data?.message || porDefecto;

export default api;
