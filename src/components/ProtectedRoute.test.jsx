// Verifica las restricciones de acceso del frontend según la sesión y el rol.

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const renderizar = (sesion, roles) =>
  render(
    <AuthContext.Provider value={sesion}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={roles}>
                <p>Contenido privado</p>
              </ProtectedRoute>
            }
          />
          <Route path="/iniciar-sesion" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('Prueba Unitaria - ProtectedRoute', () => {
  it('redirige al login si no hay sesión', () => {
    renderizar({ usuario: null, cargando: false }, ['Administrador']);

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra acceso denegado a un Cliente en una ruta de administrador', () => {
    renderizar({ usuario: { nombre: 'Ana', rol: 'Cliente' }, cargando: false }, ['Administrador']);

    expect(screen.getByText(/No tienes permisos/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('permite el acceso a un Administrador', () => {
    renderizar({ usuario: { nombre: 'Admin', rol: 'Administrador' }, cargando: false }, ['Administrador']);

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('permite el acceso a cualquier usuario con sesión cuando no se exige un rol', () => {
    renderizar({ usuario: { nombre: 'Ana', rol: 'Cliente' }, cargando: false });

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('muestra un mensaje mientras se verifica la sesión', () => {
    renderizar({ usuario: null, cargando: true }, ['Administrador']);

    expect(screen.getByText(/Verificando sesión/i)).toBeInTheDocument();
  });
});
