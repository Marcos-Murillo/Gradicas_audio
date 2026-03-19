import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LogoaudiometryForm } from './logoaudiometry-form';
import type { DatosLogoaudiometria } from '@/types/evaluation';

describe('LogoaudiometryForm', () => {
  const getInputByName = (container: HTMLElement, name: string) => {
    return container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
  };

  it('renders all required fields', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    // Check SRT fields
    expect(getInputByName(container, 'srt.derecho')).toBeInTheDocument();
    expect(getInputByName(container, 'srt.izquierdo')).toBeInTheDocument();

    // Check SDS fields
    expect(getInputByName(container, 'sds.derecho')).toBeInTheDocument();
    expect(getInputByName(container, 'sds.izquierdo')).toBeInTheDocument();
  });

  it('displays unit labels (dB and %)', () => {
    const mockOnSubmit = vi.fn();
    render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    // Check for dB units (SRT fields)
    const dbLabels = screen.getAllByText('dB');
    expect(dbLabels).toHaveLength(2);

    // Check for % units (SDS fields)
    const percentLabels = screen.getAllByText('%');
    expect(percentLabels).toHaveLength(2);
  });

  it('accepts valid numeric input for all fields', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const { container } = render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    const srtOdInput = getInputByName(container, 'srt.derecho');
    const srtOiInput = getInputByName(container, 'srt.izquierdo');
    const sdsOdInput = getInputByName(container, 'sds.derecho');
    const sdsOiInput = getInputByName(container, 'sds.izquierdo');

    await user.type(srtOdInput, '25');
    await user.type(srtOiInput, '30');
    await user.type(sdsOdInput, '85');
    await user.type(sdsOiInput, '90');

    expect(srtOdInput).toHaveValue(25);
    expect(srtOiInput).toHaveValue(30);
    expect(sdsOdInput).toHaveValue(85);
    expect(sdsOiInput).toHaveValue(90);
  });

  it('validates SDS values are between 0 and 100', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const { container } = render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    const sdsOdInput = getInputByName(container, 'sds.derecho');
    
    // Test value above 100
    await user.type(sdsOdInput, '150');
    await user.tab(); // Trigger blur validation

    await waitFor(() => {
      expect(screen.getByText(/SDS debe ser entre 0 y 100/i)).toBeInTheDocument();
    });
  });

  it('loads initial data correctly', () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosLogoaudiometria = {
      tipo: 'logoaudiometria',
      srt: {
        derecho: 20,
        izquierdo: 25,
      },
      sds: {
        derecho: 80,
        izquierdo: 85,
      },
    };

    const { container } = render(<LogoaudiometryForm onSubmit={mockOnSubmit} initialData={initialData} />);

    const srtOdInput = getInputByName(container, 'srt.derecho');
    const srtOiInput = getInputByName(container, 'srt.izquierdo');
    const sdsOdInput = getInputByName(container, 'sds.derecho');
    const sdsOiInput = getInputByName(container, 'sds.izquierdo');

    expect(srtOdInput).toHaveValue(20);
    expect(srtOiInput).toHaveValue(25);
    expect(sdsOdInput).toHaveValue(80);
    expect(sdsOiInput).toHaveValue(85);
  });

  it('displays validation message for required fields', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const { container } = render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    const srtOdInput = getInputByName(container, 'srt.derecho');
    
    // Focus and blur without entering data
    await user.click(srtOdInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/SRT OD es requerido/i)).toBeInTheDocument();
    });
  });

  it('shows help text about required fields and SDS range', () => {
    const mockOnSubmit = vi.fn();
    render(<LogoaudiometryForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/Todos los campos son requeridos/i)).toBeInTheDocument();
    expect(screen.getByText(/SDS debe estar entre 0 y 100%/i)).toBeInTheDocument();
  });
});
