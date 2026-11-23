import React, { useState, useEffect } from 'react';
import * as adminService from '../services/adminService';
import * as ordenesService from '../services/ordenesService';
import { mensajeError } from '../api/axios';

const clp = (n) => `$${(n || 0).toLocaleString('es-CL')}`;

const COLOR_ESTADO = {
  Pendiente: 'bg-warning',
  'En preparación': 'bg-info',
  Enviado: 'bg-primary',
  Entregado: 'bg-success',
  Cancelado: 'bg-danger',
};

// Una celda CSV segura: comillas dobles escapadas y protección contra fórmulas de Excel
const celdaCsv = (valor) => {
  let texto = String(valor ?? '');
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return `"${texto.replace(/"/g, '""')}"`;
};

export const AdminReportes = () => {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      setResumen(await adminService.resumen());
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los reportes.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Exporta todas las órdenes de la base de datos a un CSV que abre Excel (separador ";")
  const exportarOrdenes = async () => {
    setExportando(true);
    try {
      const ordenes = await ordenesService.listarAdmin();
      const filas = [
        ['Boleta', 'Fecha', 'Cliente', 'Correo', 'RUT', 'Dirección', 'Método de pago', 'Estado', 'Total', 'Productos'],
        ...ordenes.map((o) => [
          o.id,
          o.fecha,
          o.cliente,
          o.correo,
          o.rut,
          o.direccion,
          o.metodoPago,
          o.estado,
          o.total,
          (o.productos || []).map((p) => `${p.cantidad}x ${p.nombre}`).join(' | '),
        ]),
      ];
      const csv = '﻿' + filas.map((fila) => fila.map(celdaCsv).join(';')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `ordenes-musicmania-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(mensajeError(e, 'No se pudo exportar las órdenes.'));
    } finally {
      setExportando(false);
    }
  };

  const totalPorMetodo = resumen ? Object.values(resumen.ventasPorMetodoPago || {}).reduce((a, b) => a + b, 0) : 0;
  const maxUnidades = resumen?.masVendidos?.length ? Math.max(...resumen.masVendidos.map((p) => p.unidades)) : 0;

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <h2 className="display-6 fw-bold text-uppercase mb-1">Reportes</h2>
          <p className="text-secondary mb-0">Ventas, órdenes y productos calculados con los datos reales de la tienda.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light fw-bold" onClick={cargar} disabled={cargando}>
            <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
          </button>
          <button className="btn btn-success fw-bold" onClick={exportarOrdenes} disabled={exportando}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            {exportando ? 'Exportando...' : 'Exportar órdenes (CSV)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-light" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {!resumen && cargando && (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-danger mb-3" role="status"></div>
          <p className="mb-0">Cargando reportes...</p>
        </div>
      )}

      {resumen && (
        <div className="row g-4">
          {/* ÓRDENES POR ESTADO */}
          <div className="col-12 col-lg-6">
            <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 h-100">
              <h5 className="fw-bold text-uppercase mb-3">Órdenes por estado</h5>
              {Object.entries(resumen.ordenesPorEstado || {}).map(([estado, cantidad]) => {
                const pct = resumen.totalOrdenes ? Math.round((cantidad / resumen.totalOrdenes) * 100) : 0;
                return (
                  <div key={estado} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-bold">{estado}</span>
                      <span className="text-secondary">
                        {cantidad} ({pct}%)
                      </span>
                    </div>
                    <div className="progress bg-black" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${COLOR_ESTADO[estado] || 'bg-secondary'}`}
                        role="progressbar"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Ventas totales (sin canceladas)</span>
                <strong className="text-success">{clp(resumen.ventasTotales)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Ticket promedio</span>
                <strong>{clp(resumen.ticketPromedio)}</strong>
              </div>
            </div>
          </div>

          {/* VENTAS POR MÉTODO DE PAGO */}
          <div className="col-12 col-lg-6">
            <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 h-100">
              <h5 className="fw-bold text-uppercase mb-3">Ventas por método de pago</h5>
              {Object.keys(resumen.ventasPorMetodoPago || {}).length > 0 ? (
                Object.entries(resumen.ventasPorMetodoPago).map(([metodo, monto]) => {
                  const pct = totalPorMetodo ? Math.round((monto / totalPorMetodo) * 100) : 0;
                  return (
                    <div key={metodo} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-bold">{metodo}</span>
                        <span className="text-secondary">
                          {clp(monto)} ({pct}%)
                        </span>
                      </div>
                      <div className="progress bg-black" style={{ height: '10px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted text-center py-4 mb-0">Todavía no hay ventas registradas.</p>
              )}
            </div>
          </div>

          {/* PRODUCTOS MÁS VENDIDOS */}
          <div className="col-12 col-lg-7">
            <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 h-100">
              <h5 className="fw-bold text-uppercase mb-3">Productos más vendidos</h5>
              {resumen.masVendidos?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark align-middle mb-0">
                    <thead>
                      <tr className="text-secondary small">
                        <th>Producto</th>
                        <th style={{ width: '35%' }}>Unidades</th>
                        <th className="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.masVendidos.map((p) => (
                        <tr key={p.id || p.nombre}>
                          <td className="fw-bold">{p.nombre}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress bg-black flex-grow-1" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar bg-danger"
                                  style={{ width: `${maxUnidades ? (p.unidades / maxUnidades) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="small fw-bold">{p.unidades}</span>
                            </div>
                          </td>
                          <td className="text-end text-success fw-bold">{clp(p.ingresos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4 mb-0">Todavía no hay productos vendidos.</p>
              )}
            </div>
          </div>

          {/* INVENTARIO */}
          <div className="col-12 col-lg-5">
            <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 h-100">
              <h5 className="fw-bold text-uppercase mb-3">Inventario</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Productos en catálogo</span>
                <strong>{resumen.totalProductos}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Unidades en stock</span>
                <strong>{resumen.unidadesEnStock}</strong>
              </div>
              <h6 className="fw-bold text-uppercase text-secondary small">Stock bajo (3 unidades o menos)</h6>
              {resumen.stockBajo?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {resumen.stockBajo.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center px-0"
                    >
                      <span className="text-truncate me-2">{p.titulo}</span>
                      <span className={`badge ${p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {p.stock === 0 ? 'Agotado' : `${p.stock} un.`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Todo el inventario tiene stock suficiente.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
