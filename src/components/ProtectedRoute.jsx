import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccesoDenegado = () => (
  <main className="container py-5 text-center text-white">
    <h1 className="display-5 fw-bold text-danger">403</h1>
    <p className="fs-5">No tienes permisos para acceder a esta sección.</p>
    <Link to="/" className="btn btn-outline-light">
      Volver al inicio
    </Link>
  </main>
);

/**
 * Restringe una vista según la sesión y el rol:
 *   <ProtectedRoute>                              -> cualquier usuario con sesión
 *   <ProtectedRoute roles={['Administrador']}>    -> solo ese rol
 * Sin sesión redirige al login; con sesión pero sin el rol adecuado muestra "acceso denegado".
 * (La seguridad real la impone el backend: esto evita mostrar pantallas que el usuario no puede usar.)
 */
export const ProtectedRoute = ({ roles, children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <main className="container py-5 text-center text-white">
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/iniciar-sesion" replace state={{ desde: location.pathname }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <AccesoDenegado />;
  }

  return children;
};
