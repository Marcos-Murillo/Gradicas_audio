import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatientForm } from './patient-form';

describe('PatientForm', () => {
  it('should render all required fields', () => {
    const mockOnSubmit = vi.fn();
    
    render(<PatientForm onSubmit={mockOnSubmit} />);
    
    // Check that all required fields are present
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sexo/i)).toBeInTheDocument();
  });

  it('should display placeholder text for empty fields', () => {
    const mockOnSubmit = vi.fn();
    
    render(<PatientForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText(/ingrese apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ingrese nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/seleccione fecha/i)).toBeInTheDocument();
  });

  it('should render with initial data when provided', () => {
    const mockOnSubmit = vi.fn();
    const initialData = {
      apellido: 'García',
      nombre: 'Juan',
      fechaNacimiento: new Date('1990-01-15'),
      sexo: 'masculino' as const,
    };
    
    render(<PatientForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    const apellidoInput = screen.getByDisplayValue('García');
    const nombreInput = screen.getByDisplayValue('Juan');
    
    expect(apellidoInput).toBeInTheDocument();
    expect(nombreInput).toBeInTheDocument();
  });
});
