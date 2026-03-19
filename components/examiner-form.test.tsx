import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExaminerForm } from './examiner-form';

describe('ExaminerForm', () => {
  it('should render all required fields', () => {
    const mockOnSubmit = vi.fn();
    
    render(<ExaminerForm onSubmit={mockOnSubmit} />);
    
    // Check that all required fields are present
    expect(screen.getByLabelText(/nombre del examinador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/código profesional/i)).toBeInTheDocument();
  });

  it('should display placeholder text for empty fields', () => {
    const mockOnSubmit = vi.fn();
    
    render(<ExaminerForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText(/ingrese nombre completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/6 dígitos/i)).toBeInTheDocument();
  });

  it('should render with initial data when provided', () => {
    const mockOnSubmit = vi.fn();
    const initialData = {
      nombre: 'Dr. María López',
      codigo: '123456',
    };
    
    render(<ExaminerForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    const nombreInput = screen.getByDisplayValue('Dr. María López');
    const codigoInput = screen.getByDisplayValue('123456');
    
    expect(nombreInput).toBeInTheDocument();
    expect(codigoInput).toBeInTheDocument();
  });

  it('should limit codigo input to 6 characters', () => {
    const mockOnSubmit = vi.fn();
    
    render(<ExaminerForm onSubmit={mockOnSubmit} />);
    
    const codigoInput = screen.getByPlaceholderText(/6 dígitos/i);
    expect(codigoInput).toHaveAttribute('maxLength', '6');
  });
});
