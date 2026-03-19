import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AudiometryForm } from "./audiometry-form";
import type { DatosAudiometriaTonal } from "@/types/evaluation";

describe("AudiometryForm", () => {
  it("should render all frequency fields for both ears", () => {
    const mockOnSubmit = vi.fn();
    render(<AudiometryForm onSubmit={mockOnSubmit} />);

    // Check for OD and OI headings
    expect(screen.getByText("Oído Derecho (OD)")).toBeInTheDocument();
    expect(screen.getByText("Oído Izquierdo (OI)")).toBeInTheDocument();

    // Check for all frequency labels (6 frequencies × 2 ears = 12 fields)
    const frequencies = ["250", "500", "1000", "2000", "4000", "8000"];
    frequencies.forEach((freq) => {
      const labels = screen.getAllByText(`${freq} Hz`);
      expect(labels).toHaveLength(2); // One for OD, one for OI
    });
  });

  it("should display validation message when less than 4 frequencies are filled for an ear", async () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<AudiometryForm onSubmit={mockOnSubmit} />);

    // Fill only 3 frequencies for OD
    const inputs = container.querySelectorAll('input[type="number"]');
    const odInputs = Array.from(inputs).slice(0, 6); // First 6 are OD

    fireEvent.change(odInputs[0], { target: { value: "25" } });
    fireEvent.blur(odInputs[0]);
    fireEvent.change(odInputs[1], { target: { value: "30" } });
    fireEvent.blur(odInputs[1]);
    fireEvent.change(odInputs[2], { target: { value: "35" } });
    fireEvent.blur(odInputs[2]);

    // Try to submit
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("should accept valid data with at least 4 frequencies per ear", async () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<AudiometryForm onSubmit={mockOnSubmit} />);

    const inputs = container.querySelectorAll('input[type="number"]');
    const odInputs = Array.from(inputs).slice(0, 6); // First 6 are OD
    const oiInputs = Array.from(inputs).slice(6, 12); // Next 6 are OI

    // Fill 4 frequencies for OD
    fireEvent.change(odInputs[0], { target: { value: "25" } });
    fireEvent.change(odInputs[1], { target: { value: "30" } });
    fireEvent.change(odInputs[2], { target: { value: "35" } });
    fireEvent.change(odInputs[3], { target: { value: "40" } });

    // Fill 4 frequencies for OI
    fireEvent.change(oiInputs[0], { target: { value: "20" } });
    fireEvent.change(oiInputs[1], { target: { value: "25" } });
    fireEvent.change(oiInputs[2], { target: { value: "30" } });
    fireEvent.change(oiInputs[3], { target: { value: "35" } });

    // Submit form
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "tonal",
          oido_derecho: expect.objectContaining({
            "250": 25,
            "500": 30,
            "1000": 35,
            "2000": 40,
          }),
          oido_izquierdo: expect.objectContaining({
            "250": 20,
            "500": 25,
            "1000": 30,
            "2000": 35,
          }),
        })
      );
    });
  });

  it("should load initial data when provided", () => {
    const mockOnSubmit = vi.fn();
    const initialData: DatosAudiometriaTonal = {
      tipo: "tonal",
      oido_derecho: {
        "250": 25,
        "500": 30,
        "1000": 35,
        "2000": 40,
        "4000": 45,
        "8000": 50,
      },
      oido_izquierdo: {
        "250": 20,
        "500": 25,
        "1000": 30,
        "2000": 35,
        "4000": 40,
        "8000": 45,
      },
    };

    const { container } = render(
      <AudiometryForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs[0]).toHaveValue(25); // OD 250Hz
    expect(inputs[1]).toHaveValue(30); // OD 500Hz
    expect(inputs[6]).toHaveValue(20); // OI 250Hz
    expect(inputs[7]).toHaveValue(25); // OI 500Hz
  });

  it("should display helper text about minimum frequencies requirement", () => {
    const mockOnSubmit = vi.fn();
    render(<AudiometryForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText("* Se requieren al menos 4 frecuencias completadas por oído")
    ).toBeInTheDocument();
  });
});
