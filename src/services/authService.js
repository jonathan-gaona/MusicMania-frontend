import api from '../api/axios';
import { guardarSesion, limpiarSesion } from './sesion';

// Inicia sesión: el backend devuelve { token, refreshToken, usuario } y se guardan en el navegador
export const login = async (correo, password) => {
  const { data } = await api.post('/auth/login', { correo, password });
  guardarSesion(data);
  return data.usuario;
};

export const registrar = async (datos) => {
  const { data } = await api.post('/auth/register', datos);
  return data;
};

// Pregunta al servidor quién es el dueño del token (sirve para revalidar la sesión al recargar la página)
export const obtenerSesionActual = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const cerrarSesion = () => limpiarSesion();

// Opcional: inicio de sesión con Google (solo si el backend lo implementa)
export const loginConGoogle = async (credential) => {
  const { data } = await api.post('/auth/google', { credential });
  guardarSesion(data);
  return data.usuario;
};
