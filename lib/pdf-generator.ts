import type { ChartDocument } from "./firebase"

interface GeneratePDFOptions {
  title: string
  patient?: string
  columnA: string
  columnB: string
  rows: { a: number; b: number }[]
  chartImageData?: string
}

export async function generatePDF(options: GeneratePDFOptions) {
  const { title, patient, columnA, columnB, rows, chartImageData } = options

  const jsPDF = (await import("jspdf")).default
  const autoTable = (await import("jspdf-autotable")).default

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const margin = 15

  // Header
  pdf.setFontSize(20)
  pdf.setTextColor(59, 130, 246) // blue-500
  pdf.text(title || "Grafica Medica", margin, margin + 8)

  let currentY = margin + 15

  if (patient) {
    pdf.setFontSize(12)
    pdf.setTextColor(139, 92, 246) // purple-500
    pdf.text("Paciente: " + patient, margin, currentY)
    currentY += 7
  }

  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139) // gray-500
  const dateStr = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  pdf.text("Generado: " + dateStr, margin, currentY)
  currentY += 4

  // Divider line
  pdf.setDrawColor(139, 92, 246) // purple-500
  pdf.setLineWidth(0.8)
  pdf.line(margin, currentY, pdfWidth - margin, currentY)
  currentY += 6

  // Add chart image if provided
  if (chartImageData) {
    const chartWidth = pdfWidth - margin * 2
    const chartHeight = 80 // Height in mm
    
    pdf.addImage(chartImageData, "PNG", margin, currentY, chartWidth, chartHeight)
    currentY += chartHeight + 10
  }

  // Table with data
  const tableData = rows.map((row, index) => [
    (index + 1).toString(),
    row.a.toString(),
    row.b.toFixed(2),
  ])

  autoTable(pdf, {
    startY: currentY,
    head: [["#", columnA || "Columna A", columnB || "Columna B"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [139, 92, 246], // purple-500
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: "auto", halign: "center" },
      2: { cellWidth: "auto", halign: "center" },
    },
    margin: { left: margin, right: margin },
  })

  // @ts-ignore
  const finalY = pdf.lastAutoTable.finalY || currentY + 50

  // Statistics
  if (rows.length > 0) {
    const values = rows.map(r => r.b)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    const statsY = finalY + 10
    
    pdf.setFontSize(11)
    pdf.setTextColor(30, 41, 59) // gray-800
    pdf.text("Estadisticas:", margin, statsY)

    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105) // gray-600
    pdf.text("Minimo: " + min.toFixed(2), margin + 5, statsY + 6)
    pdf.text("Maximo: " + max.toFixed(2), margin + 5, statsY + 11)
    pdf.text("Promedio: " + avg.toFixed(2), margin + 5, statsY + 16)
  }

  // Footer
  pdf.setFontSize(7)
  pdf.setTextColor(156, 163, 175) // gray-400
  pdf.text("MedChart Pro - Visualizacion de Datos Clinicos", margin, pdfHeight - margin)
  pdf.text("Pagina 1", pdfWidth - margin - 15, pdfHeight - margin)

  const slug = (title || "grafica")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  pdf.save("grafica-" + slug + ".pdf")
}

export async function generatePDFFromChart(chart: ChartDocument, chartRef?: HTMLDivElement | null) {
  let chartImageData: string | undefined

  if (chartRef) {
    try {
      // @ts-ignore
      const domtoimage = await import("dom-to-image-more")
      // @ts-ignore
      chartImageData = await domtoimage.toPng(chartRef, {
        quality: 1,
        bgcolor: "#ffffff",
        style: {
          border: "none",
          boxShadow: "none",
          borderRadius: "0",
        },
      })
    } catch (error) {
      console.error("Error capturing chart image:", error)
    }
  }

  await generatePDF({
    title: chart.title,
    patient: chart.patient,
    columnA: chart.columnA,
    columnB: chart.columnB,
    rows: chart.rows,
    chartImageData,
  })
}
