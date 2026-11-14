import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as ordenesService from '../services/ordenesService';
import { mensajeError } from '../api/axios';

const COLOR_ESTADO = {
  Pendiente: 'warning',
  'En preparación': 'info',
  Enviado: 'primary',
  Entregado: 'success',
  Cancelado: 'danger',
};

// Historial de compras del usuario autenticado (ruta protegida: requiere iniciar sesión)
export const MisCompras = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordenesService
      .misOrdenes()
      .then(setOrdenes)
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar tu historial de compras.')))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="container py-5 text-white">
      <h1 className="text-center fw-bold text-uppercase mb-4">Mis compras</h1>

      {cargando && <p className="text-center">Cargando tus compras...</p>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!cargando && !error && ordenes.length === 0 && (
        <div className="text-center">
          <p className="fs-5">Aún no tienes compras registradas.</p>
          <Link to="/catalogo" className="btn btn-danger fw-bold">
            Ir al catálogo
          </Link>
        </div>
      )}

      {ordenes.map((orden) => (
        <div key={orden.id} className="card bg-dark border-secondary text-white mb-3">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span className="fw-bold">{orden.id}</span>
            <span className="text-secondary">{orden.fecha}</span>
            <span className={`badge bg-${COLOR_ESTADO[orden.estado] || 'secondary'}`}>{orden.estado}</span>
          </div>
          <ul className="list-group list-group-flush">
            {orden.productos.map((p, i) => (
              <li key={`${orden.id}-${i}`} className="list-group-item bg-dark text-white d-flex justify-content-between">
                <span>
                  {p.nombre} × {p.cantidad}
                </span>
                <span>${Number(p.precio * p.cantidad).toLocaleString('es-CL')}</span>
              </li>
            ))}
          </ul>
          <div className="card-footer text-end fw-bold">Total: ${Number(orden.total).toLocaleString('es-CL')}</div>
        </div>
      ))}
    </main>
  );
};
