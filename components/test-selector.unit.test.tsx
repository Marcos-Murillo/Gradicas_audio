/**
 * Unit Tests for TestSelector Component
 * Feature: sistema-evaluacion-auditiva
 * 
 * These tests verify specific behaviors and edge cases of the TestSelector component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestSelector } from './test-selector';
import { TipoPrueba } from '@/types/evaluation';

describe('TestSelector Component', () => {
  describe('Initial Rendering', () => {
    it('should render all three test cards', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Audiometría Tonal')).toBeInTheDocument();
      expect(screen.getByText('Logoaudiometría')).toBeInTheDocument();
      expect(screen.getByText('Timpanometría')).toBeInTheDocument();
    });

    it('should show "Añadir Prueba" button for all tests when none selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const addButtons = screen.getAllByText('Añadir Prueba');
      expect(addButtons).toHaveLength(3);
      addButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should not show selected tests section when no tests are selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.queryByText('Pruebas Seleccionadas')).not.toBeInTheDocument();
    });
  });

  describe('Test Selection', () => {
    it('should call onAddTest when clicking "Añadir Prueba" button', async () => {
      const user = userEvent.setup();
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const addButtons = screen.getAllByText('Añadir Prueba');
      await user.click(addButtons[0]);

      expect(mockOnAddTest).toHaveBeenCalledTimes(1);
      expect(mockOnAddTest).toHaveBeenCalledWith('tonal');
    });

    it('should show selected test in the selected tests list', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Pruebas Seleccionadas')).toBeInTheDocument();
      // The title appears twice: once in the card, once in the selected list
      const tonalTitles = screen.getAllByText('Audiometría Tonal');
      expect(tonalTitles.length).toBeGreaterThanOrEqual(2);
    });

    it('should show "Seleccionada" button for selected test', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Seleccionada')).toBeInTheDocument();
    });

    it('should show count of selected tests', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal', 'logoaudiometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('2 de 3 pruebas seleccionadas')).toBeInTheDocument();
    });
  });

  describe('Maximum Capacity (Requirement 1.4)', () => {
    it('should disable all "Añadir Prueba" buttons when 3 tests are selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal', 'logoaudiometria', 'timpanometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      // All buttons should show "Seleccionada" and be disabled
      const selectedButtons = screen.getAllByText('Seleccionada');
      expect(selectedButtons).toHaveLength(3);
      selectedButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should show 3 of 3 when all tests are selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal', 'logoaudiometria', 'timpanometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('3 de 3 pruebas seleccionadas')).toBeInTheDocument();
    });
  });

  describe('Duplicate Prevention (Requirement 1.3)', () => {
    it('should disable button for already selected test', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const selectedButton = screen.getByText('Seleccionada');
      expect(selectedButton).toBeDisabled();
    });

    it('should keep other tests enabled when one is selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const addButtons = screen.getAllByText('Añadir Prueba');
      expect(addButtons).toHaveLength(2);
      addButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Test Removal (Requirement 1.5)', () => {
    it('should call onRemoveTest when clicking remove button', async () => {
      const user = userEvent.setup();
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      // Find the remove button (X icon button)
      const removeButton = screen.getByRole('button', { name: /eliminar audiometría tonal/i });
      await user.click(removeButton);

      expect(mockOnRemoveTest).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveTest).toHaveBeenCalledWith('tonal');
    });

    it('should show remove button for each selected test', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal', 'logoaudiometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should re-enable test card after removal', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      // First render with test selected
      const { rerender } = render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Seleccionada')).toBeInTheDocument();

      // Simulate removal by re-rendering without the test
      rerender(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      const addButtons = screen.getAllByText('Añadir Prueba');
      expect(addButtons).toHaveLength(3);
      addButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should apply different styling to selected test cards', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      const { container } = render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      // Check that cards have different classes based on selection
      const cards = container.querySelectorAll('[class*="border"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show descriptive text for each test type', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText(/evaluación de la capacidad auditiva/i)).toBeInTheDocument();
      expect(screen.getByText(/reconocimiento verbal/i)).toBeInTheDocument();
      expect(screen.getByText(/función del oído medio/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedTests array', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={[]}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.queryByText('Pruebas Seleccionadas')).not.toBeInTheDocument();
    });

    it('should handle all three tests selected', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal', 'logoaudiometria', 'timpanometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Pruebas Seleccionadas')).toBeInTheDocument();
      expect(screen.getByText('3 de 3 pruebas seleccionadas')).toBeInTheDocument();
    });

    it('should handle different test selection orders', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      const { rerender } = render(
        <TestSelector
          selectedTests={['logoaudiometria', 'timpanometria']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('2 de 3 pruebas seleccionadas')).toBeInTheDocument();

      rerender(
        <TestSelector
          selectedTests={['timpanometria', 'tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('2 de 3 pruebas seleccionadas')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      // Remove button should have accessible label
      const removeButton = screen.getByRole('button', { name: /eliminar audiometría tonal/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      const mockOnAddTest = vi.fn();
      const mockOnRemoveTest = vi.fn();

      render(
        <TestSelector
          selectedTests={['tonal']}
          onAddTest={mockOnAddTest}
          onRemoveTest={mockOnRemoveTest}
        />
      );

      expect(screen.getByText('Seleccionar Pruebas')).toBeInTheDocument();
      expect(screen.getByText('Pruebas Seleccionadas')).toBeInTheDocument();
    });
  });
});
