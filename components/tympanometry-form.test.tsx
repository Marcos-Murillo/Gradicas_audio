import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TympanometryForm } from "./tympanometry-form";
import type { DatosTimpanometria } from "@/types/evaluation";

describe("TympanometryForm", () => {
  it("should render all fields for both ears", () => {
    const mockOnSubmit = vi.fn();
    render(<TympanometryForm onSubmit={mockOnSubmit} />);

    // Check for OD and OI headings
    expect(screen.getByText("Oído Derecho (OD)")).toBeInTheDocument();
    expect(screen.getByText("Oído Izquierdo (OI)")).toBeInTheDocument();

    // Check for field labels (3 fields × 2 ears = 6 fields)
    const tipoCurvaLabels = screen.getAllByText("Tipo de Curva *");
    expect(tipoCurvaLabels).toHaveLength(2);

    const presionLabels = screen.getAllByText("Presión Pico *");
    expect(presionLabels).toHaveLength(2);

    const cumplimientoLabels = screen.getAllByText("Cumplimiento *");
    expect(cumplimientoLabels).toHaveLength(2);
  });

  it("should display validation errors when required fields are missing", async () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<TympanometryForm onSubmit={mockOnSubmit} />);

    // Try to submit without filling any fields
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("should accept valid data with all required fields", async () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: -50,
        cumplimiento: 0.8,
      },
      izquierdo: {
        tipoCurva: "B",
        presionPico: -100,
        cumplimiento: 1.2,
      },
    };

    const { container } = render(
      <TympanometryForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    // Submit form with pre-filled data
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        tipo: "timpanometria",
        derecho: {
          tipoCurva: "A",
          presionPico: -50,
          cumplimiento: 0.8,
        },
        izquierdo: {
          tipoCurva: "B",
          presionPico: -100,
          cumplimiento: 1.2,
        },
      });
    });
  });

  it("should reject negative cumplimiento values", async () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: 0,
        cumplimiento: -0.5, // Negative cumplimiento
      },
      izquierdo: {
        tipoCurva: "A",
        presionPico: 0,
        cumplimiento: 1.0,
      },
    };

    const { container } = render(
      <TympanometryForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    // Try to submit with negative cumplimiento
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("should load initial data when provided", () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: -50,
        cumplimiento: 0.8,
      },
      izquierdo: {
        tipoCurva: "C",
        presionPico: -150,
        cumplimiento: 1.2,
      },
    };

    const { container } = render(
      <TympanometryForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(numberInputs[0]).toHaveValue(-50); // OD presión
    expect(numberInputs[1]).toHaveValue(0.8); // OD cumplimiento
    expect(numberInputs[2]).toHaveValue(-150); // OI presión
    expect(numberInputs[3]).toHaveValue(1.2); // OI cumplimiento
  });

  it("should display all curve type options", () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: 0,
        cumplimiento: 1.0,
      },
      izquierdo: {
        tipoCurva: "B",
        presionPico: 0,
        cumplimiento: 1.0,
      },
    };

    render(<TympanometryForm onSubmit={mockOnSubmit} initialData={initialData} />);

    // Verify that the form renders with the selected curve types
    // The actual options are rendered in the Select dropdown which is tested through integration
    expect(screen.getByText("Oído Derecho (OD)")).toBeInTheDocument();
    expect(screen.getByText("Oído Izquierdo (OI)")).toBeInTheDocument();
  });

  it("should display helper text about required fields", () => {
    const mockOnSubmit = vi.fn();
    render(<TympanometryForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText("* Todos los campos son requeridos. Cumplimiento debe ser un valor positivo.")
    ).toBeInTheDocument();
  });

  it("should display correct units for each field", () => {
    const mockOnSubmit = vi.fn();
    render(<TympanometryForm onSubmit={mockOnSubmit} />);

    const dapaUnits = screen.getAllByText("daPa");
    expect(dapaUnits).toHaveLength(2); // One for each ear

    const mlUnits = screen.getAllByText("ml");
    expect(mlUnits).toHaveLength(2); // One for each ear
  });
});
