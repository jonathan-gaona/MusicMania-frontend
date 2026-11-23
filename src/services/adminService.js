import api from '../api/axios';

/** Métricas reales del negocio calculadas por el backend (solo Administrador). */
export const resumen = async () => (await api.get('/admin/resumen')).data;
