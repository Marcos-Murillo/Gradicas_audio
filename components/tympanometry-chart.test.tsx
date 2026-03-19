import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { TympanometryChart } from "./tympanometry-chart"
import type { DatosTimpanometria } from "@/types/evaluation"

describe("TympanometryChart", () => {
  const validData: DatosTimpanometria = {
    tipo: "timpanometria",
    derecho: {
      tipoCurva: "A",
      presionPico: 0,
      cumplimiento: 1.0,
    },
    izquierdo: {
      tipoCurva: "A",
      presionPico: -10,
      cumplimiento: 0.9,
    },
  }

  it("should render chart container with valid data", () => {
    const { container } = render(<TympanometryChart data={validData} />)
    
    // Check that the ResponsiveContainer is rendered
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render chart component structure", () => {
    const { container } = render(<TympanometryChart data={validData} />)
    
    // Check that the chart structure exists
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toBeInTheDocument()
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })

  it("should have correct default dimensions", () => {
    const { container } = render(<TympanometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "100%", height: "400px" })
  })

  it("should accept custom width and height props", () => {
    const { container } = render(
      <TympanometryChart data={validData} width={800} height={600} />
    )
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ width: "800px", height: "600px" })
  })

  it("should use default height when not provided", () => {
    const { container } = render(<TympanometryChart data={validData} />)
    
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer).toHaveStyle({ height: "400px" })
  })

  it("should render with Type B curve (flat)", () => {
    const typeBData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "B",
        presionPico: -100,
        cumplimiento: 0.3,
      },
      izquierdo: {
        tipoCurva: "B",
        presionPico: -90,
        cumplimiento: 0.25,
      },
    }

    const { container } = render(<TympanometryChart data={typeBData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with Type C curve (shifted)", () => {
    const typeCData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "C",
        presionPico: -150,
        cumplimiento: 0.8,
      },
      izquierdo: {
        tipoCurva: "C",
        presionPico: -160,
        cumplimiento: 0.75,
      },
    }

    const { container } = render(<TympanometryChart data={typeCData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with Type As curve (narrow)", () => {
    const typeAsData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "As",
        presionPico: 0,
        cumplimiento: 0.5,
      },
      izquierdo: {
        tipoCurva: "As",
        presionPico: -5,
        cumplimiento: 0.45,
      },
    }

    const { container } = render(<TympanometryChart data={typeAsData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with Type Ad curve (wide)", () => {
    const typeAdData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "Ad",
        presionPico: 10,
        cumplimiento: 2.5,
      },
      izquierdo: {
        tipoCurva: "Ad",
        presionPico: 5,
        cumplimiento: 2.3,
      },
    }

    const { container } = render(<TympanometryChart data={typeAdData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should render with different curve types for each ear", () => {
    const mixedData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: 0,
        cumplimiento: 1.0,
      },
      izquierdo: {
        tipoCurva: "C",
        presionPico: -150,
        cumplimiento: 0.8,
      },
    }

    const { container } = render(<TympanometryChart data={mixedData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should handle extreme pressure values", () => {
    const extremeData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "A",
        presionPico: -400,
        cumplimiento: 1.0,
      },
      izquierdo: {
        tipoCurva: "A",
        presionPico: 200,
        cumplimiento: 0.9,
      },
    }

    const { container } = render(<TympanometryChart data={extremeData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should handle very low compliance values", () => {
    const lowComplianceData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "B",
        presionPico: 0,
        cumplimiento: 0.1,
      },
      izquierdo: {
        tipoCurva: "B",
        presionPico: 0,
        cumplimiento: 0.05,
      },
    }

    const { container } = render(<TympanometryChart data={lowComplianceData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })

  it("should handle high compliance values", () => {
    const highComplianceData: DatosTimpanometria = {
      tipo: "timpanometria",
      derecho: {
        tipoCurva: "Ad",
        presionPico: 0,
        cumplimiento: 3.0,
      },
      izquierdo: {
        tipoCurva: "Ad",
        presionPico: 0,
        cumplimiento: 2.8,
      },
    }

    const { container } = render(<TympanometryChart data={highComplianceData} />)
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument()
  })
})
