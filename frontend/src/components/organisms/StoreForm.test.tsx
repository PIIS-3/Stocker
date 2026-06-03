import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreForm } from './StoreForm';
import { useCreateStore, useUpdateStore } from '../../queries/stores.queries';

// Mockear los hooks de mutación de React Query
vi.mock('../../queries/stores.queries', () => ({
  useCreateStore: vi.fn(),
  useUpdateStore: vi.fn(),
}));

describe('StoreForm Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configurar retornos por defecto para los mocks de las mutaciones
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useCreateStore as any).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useUpdateStore as any).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    });
  });

  it('renders modal in create mode with blank fields', () => {
    render(<StoreForm isOpen={true} onClose={mockOnClose} mode="create" />);

    expect(screen.getByText('Nueva Tienda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Madrid Centro')).toHaveValue('');
    expect(screen.getByPlaceholderText('Ej: Gran Vía 12, Madrid')).toHaveValue('');
    expect(screen.getByRole('button', { name: /Crear Tienda/i })).toBeInTheDocument();
  });

  it('renders modal in view mode with read-only fields', () => {
    const initialData = {
      id_store: 42,
      store_name: 'Sucursal Norte',
      address: 'Calle Falsa 123',
      status: 'Active' as const,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    render(<StoreForm isOpen={true} onClose={mockOnClose} mode="view" initialData={initialData} />);

    expect(screen.getByText('Detalles de la Tienda')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Nombre de la Tienda/i);
    expect(nameInput).toHaveValue('Sucursal Norte');
    expect(nameInput).toHaveAttribute('readonly');

    const addressInput = screen.getByLabelText(/Dirección/i);
    expect(addressInput).toHaveValue('Calle Falsa 123');
    expect(addressInput).toHaveAttribute('readonly');

    expect(screen.queryByRole('button', { name: /Guardar Cambios/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Crear Tienda/i })).not.toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(<StoreForm isOpen={true} onClose={mockOnClose} mode="create" />);

    const submitBtn = screen.getByRole('button', { name: /Crear Tienda/i });
    fireEvent.click(submitBtn);

    // TanStack Form valida al enviar. Esperamos que aparezcan los mensajes de error.
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('La dirección es requerida')).toBeInTheDocument();
    });
  });

  it('submits form successfully and calls onSuccess in create mode', async () => {
    const mockStoreResult = {
      id_store: 10,
      store_name: 'Valencia Sur',
      address: 'Avenida 2',
      status: 'Active' as const,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    mockCreateMutateAsync.mockResolvedValueOnce(mockStoreResult);

    render(
      <StoreForm isOpen={true} onClose={mockOnClose} mode="create" onSuccess={mockOnSuccess} />
    );

    const nameInput = screen.getByLabelText(/Nombre de la Tienda/i);
    const addressInput = screen.getByLabelText(/Dirección/i);

    fireEvent.change(nameInput, { target: { value: 'Valencia Sur' } });
    fireEvent.change(addressInput, { target: { value: 'Avenida 2' } });

    const submitBtn = screen.getByRole('button', { name: /Crear Tienda/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        store_name: 'Valencia Sur',
        address: 'Avenida 2',
        status: 'Active',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith('create', mockStoreResult);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('submits form successfully and calls onSuccess in edit mode', async () => {
    const initialData = {
      id_store: 5,
      store_name: 'Bilbao',
      address: 'Calle Gran Vía',
      status: 'Active' as const,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    const mockStoreResult = { ...initialData, store_name: 'Bilbao Nueva' };
    mockUpdateMutateAsync.mockResolvedValueOnce(mockStoreResult);

    render(
      <StoreForm
        isOpen={true}
        onClose={mockOnClose}
        mode="edit"
        initialData={initialData}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Nombre de la Tienda/i);
    fireEvent.change(nameInput, { target: { value: 'Bilbao Nueva' } });

    const submitBtn = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: 5,
        data: {
          store_name: 'Bilbao Nueva',
          address: 'Calle Gran Vía',
          status: 'Active',
        },
      });
      expect(mockOnSuccess).toHaveBeenCalledWith('update', mockStoreResult);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
