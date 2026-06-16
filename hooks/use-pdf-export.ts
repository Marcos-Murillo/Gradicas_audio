import { useState } from 'react'

interface UsePDFExportOptions {
  title: string
  patient?: string
  columnA?: string
  columnB?: string
  rows?: { a: number; b: number }[]
}

export function usePDFExport({ title, patient, columnA, columnB, rows }: UsePDFExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async (chartElement: HTMLElement) => {
    setIsExporting(true)

    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      const { Canvg } = await import('canvg')

      // Find the SVG element inside the chart
      const svgElement = chartElement.querySelector('svg')
      if (!svgElement) {
        throw new Error('No SVG found in chart element')
      }

      // Clone and prepare SVG
      const clonedSvg = svgElement.cloneNode(true) as SVGElement
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      
      // Get SVG dimensions
      const svgWidth = svgElement.clientWidth || 800
      const svgHeight = svgElement.clientHeight || 400
      
      // Set explicit dimensions on cloned SVG
      clonedSvg.setAttribute('width', svgWidth.toString())
      clonedSvg.setAttribute('height', svgHeight.toString())
      
      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = svgWidth * 2 // Scale 2x for better quality
      canvas.height = svgHeight * 2
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Convert SVG to canvas using canvg with options to ensure all elements render
      const svgString = new XMLSerializer().serializeToString(clonedSvg)
      const v = await Canvg.from(ctx, svgString, {
        scaleWidth: canvas.width,
        scaleHeight: canvas.height,
        ignoreMouse: true,
        ignoreAnimation: true,
        ignoreDimensions: false,
      })
      
      // Render the SVG
      await v.render()
      
      // Stop the canvg instance
      v.stop()

      // Create PDF in landscape A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 15

      // Header with title
      pdf.setFontSize(20)
      pdf.setTextColor(59, 130, 246)
      pdf.text(title || 'Informe Médico', margin, margin + 8)

      let currentY = margin + 15

      // Patient name if provided
      if (patient) {
        pdf.setFontSize(12)
        pdf.setTextColor(139, 92, 246)
        pdf.text(`Paciente: ${patient}`, margin, currentY)
        currentY += 7
      }

      // Date
      const dateStr = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text(`Fecha: ${dateStr}`, margin, currentY)
      currentY += 4

      // Divider
      pdf.setDrawColor(139, 92, 246)
      pdf.setLineWidth(0.8)
      pdf.line(margin, currentY, pdfWidth - margin, currentY)
      currentY += 10

      // Add chart image
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdfWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Check if image fits, otherwise scale down
      const maxHeightForChart = (pdfHeight - currentY - margin - 10) * 0.6 // Use 60% of remaining space
      let finalWidth = imgWidth
      let finalHeight = imgHeight

      if (imgHeight > maxHeightForChart) {
        finalHeight = maxHeightForChart
        finalWidth = (canvas.width * maxHeightForChart) / canvas.height
      }

      const imgX = (pdfWidth - finalWidth) / 2
      pdf.addImage(imgData, 'PNG', imgX, currentY, finalWidth, finalHeight)
      currentY += finalHeight + 10

      // Add data table if rows are provided
      if (rows && rows.length > 0) {
        const tableData = rows.map((row, index) => [
          (index + 1).toString(),
          row.a.toString(),
          row.b.toFixed(2),
        ])

        autoTable(pdf, {
          startY: currentY,
          head: [['#', columnA || 'Columna A', columnB || 'Columna B']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [139, 92, 246],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: {
            fontSize: 8,
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251],
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto', halign: 'center' },
            2: { cellWidth: 'auto', halign: 'center' },
          },
          margin: { left: margin, right: margin },
        })

        // @ts-expect-error - jsPDF-Autotable augments jsPDF instance
        currentY = pdf.lastAutoTable.finalY + 10

        // Add statistics
        const values = rows.map(r => r.b)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const avg = values.reduce((a, b) => a + b, 0) / values.length

        pdf.setFontSize(10)
        pdf.setTextColor(30, 41, 59)
        pdf.text('Estadísticas:', margin, currentY)

        pdf.setFontSize(8)
        pdf.setTextColor(71, 85, 105)
        pdf.text(`Mínimo: ${min.toFixed(2)}`, margin + 5, currentY + 5)
        pdf.text(`Máximo: ${max.toFixed(2)}`, margin + 5, currentY + 10)
        pdf.text(`Promedio: ${avg.toFixed(2)}`, margin + 5, currentY + 15)
      }

      // Footer
      pdf.setFontSize(7)
      pdf.setTextColor(156, 163, 175)
      pdf.text('Página 1', pdfWidth - margin - 15, pdfHeight - margin)

      // Generate filename
      const date = new Date()
      const dateFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const slug = (title || 'informe')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      const filename = `Informe-${slug}-${dateFormatted}.pdf`
      pdf.save(filename)

      return true
    } catch (error) {
      console.error('Error exporting PDF:', error)
      return false
    } finally {
      setIsExporting(false)
    }
  }

  return { exportToPDF, isExporting }
}
