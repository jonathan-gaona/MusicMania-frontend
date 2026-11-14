import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { leerToken, leerUsuario, actualizarUsuario, suscribirSesion } from '../services/sesion';

// Valor por defecto: permite usar los componentes sin proveedor (por ejemplo en pruebas)
export const AuthContext = createContext({
  usuario: null,
  estaAutenticado: false,
  esAdmin: false,
  cargando: false,
  login: authService.login,
  logout: authService.cerrarSesion,
});

export const useAuth = () => useContext(AuthContext);

/**
 * Gestión de sesión del frontend:
 *  - Persistencia: el usuario y los tokens viven en localStorage, así la sesión sobrevive a recargas.
 *  - Revalidación: al cargar la app se consulta /auth/me; si el token venció se renueva solo (ver api/axios.js)
 *    y, si no se puede, la sesión se cierra.
 *  - Sincronización: login, logout o token vencido se reflejan de inmediato en toda la interfaz
 *    (y también en otras pestañas del navegador).
 */
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => (leerToken() ? leerUsuario() : null));
  const [cargando, setCargando] = useState(() => !!leerToken());

  // Al abrir o recargar la página: confirma con el servidor que la sesión sigue siendo válida
  useEffect(() => {
    let activo = true;
    if (!leerToken()) {
      setCargando(false);
      return undefined;
    }
    authService
      .obtenerSesionActual()
      .then((datos) => {
        if (activo) actualizarUsuario(datos); // el servidor es la fuente de verdad del rol
      })
      .catch(() => {
        // Si el token y el refresh token no sirven, api/axios.js ya limpió la sesión
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  // Mantiene el estado sincronizado con el almacén (login, logout, token vencido, otras pestañas)
  useEffect(() => {
    const sincronizar = () => setUsuario(leerToken() ? leerUsuario() : null);
    const darseDeBaja = suscribirSesion(sincronizar);
    window.addEventListener('storage', sincronizar);
    return () => {
      darseDeBaja();
      window.removeEventListener('storage', sincronizar);
    };
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: !!usuario,
      esAdmin: usuario?.rol === 'Administrador',
      cargando,
      login: authService.login,
      logout: authService.cerrarSesion,
    }),
    [usuario, cargando]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};
