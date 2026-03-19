"use client"

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ChartDocument } from '@/lib/firebase'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  patient: {
    fontSize: 14,
    color: '#8b5cf6',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 12,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
    marginBottom: 20,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    marginBottom: 5,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCol: {
    fontSize: 9,
    color: '#1f2937',
    textAlign: 'center',
  },
  col1: {
    width: '15%',
  },
  col2: {
    width: '42.5%',
  },
  col3: {
    width: '42.5%',
  },
  statsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#475569',
    width: '40%',
  },
  statValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
})

interface PDFChartProps {
  chart: ChartDocument
}

export function PDFChart({ chart }: PDFChartProps) {
  const dateStr = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const values = chart.rows.map(r => r.b)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{chart.title || "Grafica Medica"}</Text>
          {chart.patient && (
            <Text style={styles.patient}>Paciente: {chart.patient}</Text>
          )}
          <Text style={styles.date}>Generado: {dateStr}</Text>
          <View style={styles.divider} />
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.col1]}>#</Text>
            <Text style={[styles.tableColHeader, styles.col2]}>
              {chart.columnA || "Columna A"}
            </Text>
            <Text style={[styles.tableColHeader, styles.col3]}>
              {chart.columnB || "Columna B"}
            </Text>
          </View>
          {chart.rows.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCol, styles.col2]}>{row.a}</Text>
              <Text style={[styles.tableCol, styles.col3]}>{row.b.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Estadísticas</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mínimo:</Text>
            <Text style={styles.statValue}>{min.toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Máximo:</Text>
            <Text style={styles.statValue}>{max.toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Promedio:</Text>
            <Text style={styles.statValue}>{avg.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>MedChart Pro - Visualización de Datos Clínicos</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  )
}
