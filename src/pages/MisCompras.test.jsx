import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MisCompras } from './MisCompras';
import * as ordenesService from '../services/ordenesService';

vi.mock('../services/ordenesService', () => ({ misOrdenes: vi.fn() }));

describe('Prueba Unitaria - MisCompras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar las compras del usuario devueltas por la API', async () => {
    ordenesService.misOrdenes.mockResolvedValue([
      {
        id: 'BOL-2026-123456',
        fecha: '2026-11-14 12:00',
        estado: 'Pendiente',
        total: 20000,
        productos: [{ id: 'alb-1', nombre: 'Naturaleza Muerta', precio: 10000, cantidad: 2 }],
      },
    ]);

    render(
      <BrowserRouter>
        <MisCompras />
      </BrowserRouter>
    );

    expect(await screen.findByText('BOL-2026-123456')).toBeInTheDocument();
    expect(screen.getByText(/Naturaleza Muerta/i)).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('debe indicar cuando no hay compras', async () => {
    ordenesService.misOrdenes.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <MisCompras />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Aún no tienes compras/i)).toBeInTheDocument();
  });

  it('debe mostrar el error si la API falla', async () => {
    ordenesService.misOrdenes.mockRejectedValue({ response: { data: { message: 'No se pudo cargar tu historial de compras.' } } });

    render(
      <BrowserRouter>
        <MisCompras />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No se pudo cargar tu historial/i)).toBeInTheDocument();
  });
});
