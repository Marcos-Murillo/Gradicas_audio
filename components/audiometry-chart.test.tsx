import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { AudiometryChart } from "./audiometry-chart"
import type { DatosAudiometriaTonal } from "@/types/evaluation"

describe("AudiometryChart", () => {
  const validData: DatosAudiometriaTonal = {
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
  }

  it("should render chart container with valid data", () => {
    const { container } = render(<AudiometryChart data={validData} />)
    
    // Check that the ResponsiveContainer is rendered
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render chart component structure", () => {
    const { container } = render(<AudiometryChart data={validData} />)
    
    // Check that the chart structure exists
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toBeInTheDocument()
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })

  it("should have correct default dimensions", () => {
    const { container } = render(<AudiometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "100%", height: "400px" })
  })

  it("should show error message when insufficient data for both ears", () => {
    const insufficientData: DatosAudiometriaTonal = {
      tipo: "tonal",
      oido_derecho: {
        "250": 25,
        "500": 30,
        "1000": 35,
      },
      oido_izquierdo: {
        "250": 20,
        "500": 25,
      },
    }

    render(<AudiometryChart data={insufficientData} />)
    
    expect(
      screen.getByText(/Datos insuficientes para generar la gráfica/)
    ).toBeInTheDocument()
  })

  it("should render chart when at least one ear has 4+ frequencies", () => {
    const partialData: DatosAudiometriaTonal = {
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
      },
    }

    const { container } = render(<AudiometryChart data={partialData} />)
    
    // Should render chart even if only one ear has sufficient data
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should accept custom width and height props", () => {
    const { container } = render(
      <AudiometryChart data={validData} width={800} height={600} />
    )
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "800px", height: "600px" })
  })

  it("should use default height when not provided", () => {
    const { container } = render(<AudiometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })
})
