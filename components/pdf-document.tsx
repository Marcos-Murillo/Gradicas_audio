import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFTympanometryChart } from '@/components/pdf-tympanometry-chart';
import { PDFAudiometryChart } from '@/components/pdf-audiometry-chart';
import { PDFLogoaudiometryChart } from '@/components/pdf-logoaudiometry-chart';
import type { 
  EvaluacionAuditiva, 
  DatosAudiometriaTonal, 
  DatosLogoaudiometria,
} from '@/types/evaluation';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: '1 solid #e5e7eb',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  testSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 10,
  },
  dataGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dataColumn: {
    flex: 1,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  earTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  earTitleRight: {
    color: '#dc2626',
  },
  earTitleLeft: {
    color: '#2563eb',
  },
  dataItem: {
    fontSize: 9,
    marginBottom: 3,
    color: '#374151',
  },
  separator: {
    borderBottom: '1 solid #e5e7eb',
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
});

interface PDFDocumentProps {
  evaluation: EvaluacionAuditiva;
}

export function PDFDocument({ evaluation }: PDFDocumentProps) {
  const { paciente, pruebas, examinador, fechaExamen } = evaluation;

  const fechaNacimientoStr = format(paciente.fechaNacimiento, 'dd/MM/yyyy', { locale: es });
  const fechaExamenStr = format(fechaExamen, 'dd/MM/yyyy HH:mm', { locale: es });
  const sexoCapitalizado = paciente.sexo.charAt(0).toUpperCase() + paciente.sexo.slice(1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SISTEMA EVALUACIÓN AUDITIVA</Text>
          <Text style={styles.headerSubtitle}>Universidad del Valle</Text>
        </View>

        {/* Datos del Paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Paciente</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Apellido</Text>
              <Text style={styles.value}>{paciente.apellido}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{paciente.nombre}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <Text style={styles.value}>{fechaNacimientoStr}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Sexo</Text>
              <Text style={styles.value}>{sexoCapitalizado}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View>
            <Text style={styles.label}>Fecha y Hora del Examen</Text>
            <Text style={styles.value}>{fechaExamenStr}</Text>
          </View>
        </View>

        {/* Pruebas Realizadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Pruebas Realizadas</Text>
          {pruebas.map((prueba, index) => (
            <View key={index}>
              {prueba.tipo === 'tonal' && (
                <View>
                  <Text style={styles.testTitle}>{index + 1}. Audiometría Tonal</Text>
                  <AudiometryDataSection data={prueba} />
                </View>
              )}
              {prueba.tipo === 'logoaudiometria' && (
                <View>
                  <Text style={styles.testTitle}>{index + 1}. Logoaudiometría</Text>
                  <LogoaudiometryPDFSection data={prueba} index={index + 1} />
                </View>
              )}
              {prueba.tipo === 'timpanometria' && (
                <View>
                  <Text style={styles.testTitle}>{index + 1}. Timpanometría</Text>
                </View>
              )}
              {index < pruebas.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* Datos del Examinador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Examinador</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{examinador.nombre}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Código Profesional</Text>
              <Text style={styles.value}>{examinador.codigo}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Sistema de Evaluación Auditiva Profesional — Universidad del Valle
        </Text>
      </Page>

      {/* Páginas de gráficas — una por prueba */}
      {pruebas.map((prueba, index) => (
        <Page key={`chart-${index}`} size="A4" style={styles.page}>
          <View style={styles.section}>
            {prueba.tipo === 'tonal' && (
              <View>
                <Text style={styles.testTitle}>Audiograma — Audiometría Tonal</Text>
                <PDFAudiometryChart data={prueba} />
              </View>
            )}
            {prueba.tipo === 'logoaudiometria' && (
              <View>
                <Text style={styles.testTitle}>Gráfica — Logoaudiometría</Text>
                <PDFLogoaudiometryChart data={prueba} />
              </View>
            )}
            {prueba.tipo === 'timpanometria' && (
              <View>
                <Text style={styles.testTitle}>Timpanograma</Text>
                <PDFTympanometryChart data={prueba} />
              </View>
            )}
          </View>
          <Text style={styles.footer}>
            Sistema de Evaluación Auditiva Profesional — Universidad del Valle
          </Text>
        </Page>
      ))}
    </Document>
  );
}

// Sección de datos de Audiometría Tonal para PDF
function AudiometryDataSection({ data }: { data: DatosAudiometriaTonal }) {
  const frequencies = ['250', '500', '1000', '2000', '4000', '8000'] as const;

  return (
    <View style={styles.dataGrid}>
      <View style={styles.dataColumn}>
        <Text style={[styles.earTitle, styles.earTitleRight]}>Oído Derecho (OD):</Text>
        {frequencies.map((freq) => {
          const value = data.oido_derecho[freq];
          return (
            <Text key={`od-${freq}`} style={styles.dataItem}>
              {freq} Hz: {value !== undefined ? `${value} dB` : 'N/A'}
            </Text>
          );
        })}
      </View>
      <View style={styles.dataColumn}>
        <Text style={[styles.earTitle, styles.earTitleLeft]}>Oído Izquierdo (OI):</Text>
        {frequencies.map((freq) => {
          const value = data.oido_izquierdo[freq];
          return (
            <Text key={`oi-${freq}`} style={styles.dataItem}>
              {freq} Hz: {value !== undefined ? `${value} dB` : 'N/A'}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// Sección de Logoaudiometría para PDF
function LogoaudiometryPDFSection({ 
  data, 
  index,
}: { 
  data: DatosLogoaudiometria; 
  index: number;
}) {
  return (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>{index}. Logoaudiometría</Text>
      <View style={styles.dataGrid}>
        <View style={styles.dataColumn}>
          <Text style={styles.earTitle}>Oído Derecho (OD):</Text>
          {data.puntos.derecho.map(p => (
            <Text key={p.db} style={[styles.dataItem, styles.earTitleRight]}>
              {p.db} dB → {p.correctas}/10 = {Math.round((p.correctas / 10) * 100)}%
            </Text>
          ))}
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.earTitle}>Oído Izquierdo (OI):</Text>
          {data.puntos.izquierdo.map(p => (
            <Text key={p.db} style={[styles.dataItem, styles.earTitleLeft]}>
              {p.db} dB → {p.correctas}/10 = {Math.round((p.correctas / 10) * 100)}%
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}


