import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { LogoaudiometryChart } from "./logoaudiometry-chart"
import type { DatosLogoaudiometria } from "@/types/evaluation"

describe("LogoaudiometryChart", () => {
  const validData: DatosLogoaudiometria = {
    tipo: "logoaudiometria",
    srt: {
      derecho: 30,
      izquierdo: 25,
    },
    sds: {
      derecho: 95,
      izquierdo: 90,
    },
  }

  it("should render chart container with valid data", () => {
    const { container } = render(<LogoaudiometryChart data={validData} />)
    
    // Check that the ResponsiveContainer is rendered
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render chart component structure", () => {
    const { container } = render(<LogoaudiometryChart data={validData} />)
    
    // Check that the chart structure exists
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toBeInTheDocument()
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })

  it("should have correct default dimensions", () => {
    const { container } = render(<LogoaudiometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "100%", height: "400px" })
  })

  it("should accept custom width and height props", () => {
    const { container } = render(
      <LogoaudiometryChart data={validData} width={800} height={600} />
    )
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "800px", height: "600px" })
  })

  it("should use default height when not provided", () => {
    const { container } = render(<LogoaudiometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })

  it("should render with different SRT and SDS values", () => {
    const differentData: DatosLogoaudiometria = {
      tipo: "logoaudiometria",
      srt: {
        derecho: 40,
        izquierdo: 35,
      },
      sds: {
        derecho: 85,
        izquierdo: 80,
      },
    }

    const { container } = render(<LogoaudiometryChart data={differentData} />)
    
    // Should render successfully with different values
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with extreme SRT values", () => {
    const extremeData: DatosLogoaudiometria = {
      tipo: "logoaudiometria",
      srt: {
        derecho: 0,
        izquierdo: 100,
      },
      sds: {
        derecho: 100,
        izquierdo: 50,
      },
    }

    const { container } = render(<LogoaudiometryChart data={extremeData} />)
    
    // Should handle extreme values gracefully
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with low SDS values", () => {
    const lowSDSData: DatosLogoaudiometria = {
      tipo: "logoaudiometria",
      srt: {
        derecho: 50,
        izquierdo: 45,
      },
      sds: {
        derecho: 30,
        izquierdo: 25,
      },
    }

    const { container } = render(<LogoaudiometryChart data={lowSDSData} />)
    
    // Should render with low discrimination scores
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })
})
