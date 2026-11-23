import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '../components/AdminNavbar';
import { AdminUsuarios } from './AdminUsuarios';
import { AdminOrdenes } from './AdminOrdenes';
import { AdminBlogs } from './AdminBlogs';
import { AdminProductos } from './AdminProductos';
import { AdminCategorias } from './AdminCategorias';
import { AdminReportes } from './AdminReportes';
import * as adminService from '../services/adminService';
import { cerrarSesion } from '../services/authService';
import { mensajeError } from '../api/axios';

const clp = (n) => `$${(n || 0).toLocaleString('es-CL')}`;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // ESTADO DE NAVEGACIÓN
  const [tabActiva, setTabActiva] = useState('dashboard');

  // MÉTRICAS REALES (GET /admin/resumen, calculadas por el backend desde la base de datos)
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState('');

  const esAdmin = usuarioSesion?.rol === 'Administrador';
  const esVendedor = usuarioSesion?.rol === 'Vendedor';

  // VERIFICACIÓN DE PERMISOS (Administrador o Vendedor)
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuarioSesion');

    if (!sesionGuardada) {
      navigate('/iniciar-sesion', { replace: true });
      return;
    }

    try {
      const sesion = JSON.parse(sesionGuardada);
      if (sesion && (sesion.rol === 'Administrador' || sesion.rol === 'Vendedor')) {
        setUsuarioSesion(sesion);
        // El vendedor solo tiene acceso a Órdenes y Productos; inicia en Órdenes
        if (sesion.rol === 'Vendedor') {
          setTabActiva('ordenes');
        }
        setCargando(false);
      } else {
        navigate('/iniciar-sesion', { replace: true });
      }
    } catch (error) {
      cerrarSesion();
      navigate('/iniciar-sesion', { replace: true });
    }
  }, [navigate]);

  // CARGAR MÉTRICAS DESDE LA API (Solo Administrador)
  const cargarResumen = async () => {
    if (!esAdmin) return;
    setCargandoResumen(true);
    setErrorResumen('');
    try {
      setResumen(await adminService.resumen());
    } catch (error) {
      if (!localStorage.getItem('token')) {
        navigate('/iniciar-sesion', { replace: true });
        return;
      }
      setErrorResumen(mensajeError(error, 'No se pudieron cargar las métricas.'));
    } finally {
      setCargandoResumen(false);
    }
  };

  // Se recarga al entrar al Dashboard para reflejar altas, compras y cambios de estado recientes
  useEffect(() => {
    if (!cargando && esAdmin && tabActiva === 'dashboard') {
      cargarResumen();
    }
  }, [cargando, tabActiva, esAdmin]);

  if (cargando) {
    return (
      <div className="bg-dark text-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-secondary fw-bold text-uppercase fs-6">Verificando permisos...</p>
      </div>
    );
  }

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      {/* NAVBAR DE GESTIÓN */}
      <AdminNavbar usuarioSesion={usuarioSesion} />

      <div className="d-flex flex-grow-1">
        {/* MENÚ LATERAL INTERACTIVO FILTRADO POR ROL */}
        <aside
          className="bg-black bg-opacity-50 border-end border-secondary p-3 d-none d-md-flex flex-column justify-content-between"
          style={{ width: '250px' }}
        >
          <nav className="nav nav-pills flex-column gap-2">
            {esAdmin && (
              <button
                onClick={() => setTabActiva('dashboard')}
                className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                  tabActiva === 'dashboard' ? 'bg-danger text-white' : 'text-light opacity-75'
                }`}
              >
                <i className="bi bi-speedometer2"></i> Dashboard
              </button>
            )}

            {/* Visible para Administrador y Vendedor */}
            <button
              onClick={() => setTabActiva('ordenes')}
              className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                tabActiva === 'ordenes' ? 'bg-danger text-white' : 'text-light opacity-75'
              }`}
            >
              <i className="bi bi-receipt"></i> Órdenes
            </button>

            {/* Visible para Administrador y Vendedor */}
            <button
              onClick={() => setTabActiva('productos')}
              className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                tabActiva === 'productos' ? 'bg-danger text-white' : 'text-light opacity-75'
              }`}
            >
              <i className="bi bi-disc"></i> Productos
            </button>

            {/* Exclusivos de Administrador (ocultos para Vendedor) */}
            {esAdmin && (
              <>
                <button
                  onClick={() => setTabActiva('categorias')}
                  className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                    tabActiva === 'categorias' ? 'bg-danger text-white' : 'text-light opacity-75'
                  }`}
                >
                  <i className="bi bi-tags"></i> Categorías
                </button>

                <button
                  onClick={() => setTabActiva('usuarios')}
                  className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                    tabActiva === 'usuarios' ? 'bg-danger text-white' : 'text-light opacity-75'
                  }`}
                >
                  <i className="bi bi-people"></i> Usuarios
                </button>

                <button
                  onClick={() => setTabActiva('blogs')}
                  className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                    tabActiva === 'blogs' ? 'bg-danger text-white' : 'text-light opacity-75'
                  }`}
                >
                  <i className="bi bi-journal-text"></i> Blogs
                </button>

                <button
                  onClick={() => setTabActiva('reportes')}
                  className={`nav-link text-start d-flex align-items-center gap-2 py-2 px-3 fw-semibold rounded ${
                    tabActiva === 'reportes' ? 'bg-danger text-white' : 'text-light opacity-75'
                  }`}
                >
                  <i className="bi bi-bar-chart-line"></i> Reportes
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow-1 p-4 p-md-5 overflow-auto">
          
          {/* VISTA 1: DASHBOARD PRINCIPAL (Solo Administrador) */}
          {esAdmin && tabActiva === 'dashboard' && (
            <div className="animate__animated animate__fadeIn">
              <header className="mb-4 pb-3 border-bottom border-secondary">
                <h2 className="display-6 fw-bold text-uppercase mb-1">Dashboard</h2>
                <p className="text-secondary mb-0">Resumen general de las operaciones de MusicMania.</p>
              </header>

              {/* ESTADO DE CARGA DE LAS MÉTRICAS */}
              {errorResumen && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{errorResumen}</span>
                  <button className="btn btn-sm btn-outline-light" onClick={cargarResumen}>
                    Reintentar
                  </button>
                </div>
              )}

              {!resumen && cargandoResumen && (
                <div className="text-center py-5 text-secondary">
                  <div className="spinner-border text-danger mb-3" role="status"></div>
                  <p className="mb-0">Cargando métricas...</p>
                </div>
              )}

              {resumen && (
                <>
                  {/* TARJETAS KPIS (datos reales de la base de datos) */}
                  <section className="row g-4 mb-4">
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="bg-primary bg-opacity-20 border border-primary p-4 rounded-3 shadow d-flex align-items-center justify-content-between h-100">
                        <div>
                          <span className="text-uppercase fs-7 fw-bold text-white">Ventas Totales</span>
                          <h3 className="display-6 fw-bold my-1">{clp(resumen.ventasTotales)}</h3>
                          <small className="text-light opacity-75">
                            Ticket promedio: <strong>{clp(resumen.ticketPromedio)}</strong>
                          </small>
                        </div>
                        <i className="bi bi-cart-check fs-1 text-primary"></i>
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="bg-info bg-opacity-20 border border-info p-4 rounded-3 shadow d-flex align-items-center justify-content-between h-100">
                        <div>
                          <span className="text-uppercase fs-7 fw-bold text-white">Órdenes</span>
                          <h3 className="display-6 fw-bold my-1">{resumen.totalOrdenes}</h3>
                          <small className="text-light opacity-75">
                            <strong>{resumen.ordenesPorEstado?.Pendiente || 0}</strong> pendientes
                          </small>
                        </div>
                        <i className="bi bi-receipt fs-1 text-info"></i>
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="bg-success bg-opacity-20 border border-success p-4 rounded-3 shadow d-flex align-items-center justify-content-between h-100">
                        <div>
                          <span className="text-uppercase fs-7 fw-bold text-white">Productos</span>
                          <h3 className="display-6 fw-bold my-1">{resumen.totalProductos}</h3>
                          <small className="text-light opacity-75">
                            <strong>{resumen.unidadesEnStock}</strong> unidades en stock
                          </small>
                        </div>
                        <i className="bi bi-box-seam fs-1 text-success"></i>
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="bg-warning bg-opacity-20 border border-warning p-4 rounded-3 shadow d-flex align-items-center justify-content-between h-100">
                        <div>
                          <span className="text-uppercase fs-7 fw-bold text-white">Usuarios Registrados</span>
                          <h3 className="display-6 fw-bold my-1">{resumen.totalUsuarios}</h3>
                          <small className="text-light opacity-75">
                            <strong>{resumen.clientes}</strong> Clientes | <strong>{resumen.administradores}</strong> Admins
                            {resumen.vendedores > 0 && (
                              <> | <strong>{resumen.vendedores}</strong> Vendedores</>
                            )}
                          </small>
                        </div>
                        <i className="bi bi-people fs-1 text-warning"></i>
                      </div>
                    </div>
                  </section>

                  {/* ÚLTIMAS ÓRDENES Y STOCK BAJO */}
                  <section className="row g-4 mb-5">
                    <div className="col-12 col-xl-8">
                      <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-bold text-uppercase mb-0">Últimas órdenes</h5>
                          <button className="btn btn-sm btn-outline-light" onClick={() => setTabActiva('ordenes')}>
                            Ver todas
                          </button>
                        </div>
                        {resumen.ultimasOrdenes?.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-dark table-hover align-middle mb-0">
                              <thead>
                                <tr className="text-secondary small">
                                  <th>Boleta</th>
                                  <th>Cliente</th>
                                  <th>Total</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {resumen.ultimasOrdenes.map((o) => (
                                  <tr key={o.id}>
                                    <td>
                                      <span className="fw-bold text-info d-block">{o.id}</span>
                                      <small className="text-muted">{o.fecha}</small>
                                    </td>
                                    <td>{o.cliente}</td>
                                    <td className="fw-bold text-success">{clp(o.total)}</td>
                                    <td>
                                      <span className="badge bg-secondary text-uppercase">{o.estado}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted text-center py-4 mb-0">Aún no hay órdenes registradas.</p>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-xl-4">
                      <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-bold text-uppercase mb-0">Stock bajo</h5>
                          <span className={`badge ${resumen.productosStockBajo > 0 ? 'bg-danger' : 'bg-success'}`}>
                            {resumen.productosStockBajo}
                          </span>
                        </div>
                        {resumen.stockBajo?.length > 0 ? (
                          <ul className="list-group list-group-flush">
                            {resumen.stockBajo.slice(0, 6).map((p) => (
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
                          <p className="text-muted text-center py-4 mb-0">Todo el inventario tiene stock suficiente.</p>
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* ACCESOS RÁPIDOS A MÓDULOS */}
              <section>
                <h4 className="fw-bold text-uppercase mb-4 text-light">Módulos del Sistema</h4>
                <div className="row g-4">
                  {[
                    { id: 'dashboard', title: 'Dashboard', desc: 'Visión general de métricas.', icon: 'bi-speedometer2', color: 'text-danger' },
                    { id: 'ordenes', title: 'Órdenes', desc: 'Gestión y seguimiento de órdenes.', icon: 'bi-receipt', color: 'text-info' },
                    { id: 'productos', title: 'Productos', desc: 'Administrar inventario y catálogo.', icon: 'bi-disc', color: 'text-success' },
                    { id: 'categorias', title: 'Categorías', desc: 'Organizar productos por géneros.', icon: 'bi-tags', color: 'text-warning' },
                    { id: 'usuarios', title: 'Usuarios', desc: resumen ? `Gestión de ${resumen.totalUsuarios} cuentas registradas.` : 'Gestión de cuentas y roles.', icon: 'bi-people', color: 'text-primary' },
                    { id: 'blogs', title: 'Blogs', desc: 'Administración de artículos y noticias.', icon: 'bi-journal-text', color: 'text-info' },
                    { id: 'reportes', title: 'Reportes', desc: 'Generación de informes detallados.', icon: 'bi-bar-chart-line', color: 'text-danger' }
                  ].map((mod) => (
                    <div key={mod.id} className="col-12 col-md-6 col-lg-4">
                      <div
                        onClick={() => setTabActiva(mod.id)}
                        className="bg-secondary bg-opacity-10 p-4 rounded-3 border border-secondary shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer hover-border-light"
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi ${mod.icon} fs-1 ${mod.color} mb-3`}></i>
                        <h5 className="fw-bold mb-2">{mod.title}</h5>
                        <p className="text-secondary small mb-0">{mod.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VISTAS DE COMPONENTES */}
          {tabActiva === 'ordenes' && <AdminOrdenes soloLectura={esVendedor} />}
          {tabActiva === 'productos' && <AdminProductos soloLectura={esVendedor} />}
          {esAdmin && tabActiva === 'usuarios' && <AdminUsuarios />}
          {esAdmin && tabActiva === 'blogs' && <AdminBlogs />}
          {esAdmin && tabActiva === 'categorias' && <AdminCategorias />}

          {esAdmin && tabActiva === 'reportes' && <AdminReportes />}

        </main>
      </div>
    </div>
  );
};