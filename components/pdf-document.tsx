import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFTympanometryChart } from '@/components/pdf-tympanometry-chart';
import { PDFReflexGrid } from '@/components/pdf-reflex-grid';
import { PDFAudiometryChart } from '@/components/pdf-audiometry-chart';
import { PDFLogoaudiometryChart } from '@/components/pdf-logoaudiometry-chart';
import type { 
  EvaluacionAuditiva, 
  DatosAudiometriaTonal, 
  DatosLogoaudiometria,
  DatosTimpanometria,
} from '@/types/evaluation';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    paddingTop: 62,
    paddingHorizontal: 28,
    paddingBottom: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#2f5c9e',
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
    fontSize: 9,
    fontWeight: 'bold',
    color: '#24306b',
    marginBottom: 2,
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
    color: '#d11c1c',
  },
  earTitleLeft: {
    color: '#1452d1',
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
    bottom: 16,
    left: 28,
    right: 28,
    textAlign: 'center',
    fontSize: 8,
    color: '#5b6675',
    borderTopWidth: 1,
    borderTopColor: '#d7dce4',
    paddingTop: 4,
  },
});

interface PDFDocumentProps {
  evaluation: EvaluacionAuditiva;
  logoSrc?: string;
}

function PdfClinicHeader({ logoSrc, fecha }: { logoSrc?: string; fecha: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#3b2a63', paddingBottom: 4, marginBottom: 6 }}>
      {logoSrc ? <Image src={logoSrc} style={{ width: 36, height: 36, objectFit: 'contain' }} /> : null}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#24306b' }}>ESPECIALISTA EN VÉRTIGO Y PÉRDIDA AUDITIVA</Text>
        <Text style={{ fontSize: 7, color: '#3a4358' }}>Cra. 30 # 32-29, B/ Centro — Frente al Banco de la Mujer · Cel. 316 704 5684</Text>
      </View>
      <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1a2230' }}>{fecha}</Text>
    </View>
  );
}

function EpsBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ borderWidth: 0.8, borderColor: '#1a2230', marginBottom: 5 }}>
      <View style={{ backgroundColor: '#2f5c9e', paddingVertical: 2, paddingHorizontal: 4 }}>
        <Text style={{ color: '#ffffff', fontSize: 7, fontWeight: 'bold' }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function EpsCell({ label, value, flex = 1 }: { label: string; value: string; flex?: number }) {
  return (
    <View style={{ flex, borderRightWidth: 0.5, borderRightColor: '#b9c0cc', paddingHorizontal: 3, paddingVertical: 2 }}>
      <Text style={{ fontSize: 5.5, color: '#5b6675' }}>{label}</Text>
      <Text style={{ fontSize: 8, color: '#1a2230' }}>{value || '—'}</Text>
    </View>
  );
}

export function PDFDocument({ evaluation, logoSrc }: PDFDocumentProps) {
  const { paciente, pruebas, examinador, fechaExamen } = evaluation;

  const fechaNacimientoStr = format(paciente.fechaNacimiento, 'dd/MM/yyyy', { locale: es });
  const fechaExamenStr = format(fechaExamen, 'dd/MM/yyyy HH:mm', { locale: es });
  const sexoCapitalizado = paciente.sexo.charAt(0).toUpperCase() + paciente.sexo.slice(1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={{ position: 'absolute', top: 14, left: 28, right: 28 }}>
          <PdfClinicHeader logoSrc={logoSrc} fecha={format(fechaExamen, 'dd/MM/yyyy', { locale: es })} />
        </View>

        <EpsBox title="IDENTIFICACIÓN">
          <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#b9c0cc' }}>
            <EpsCell label="APELLIDO" value={paciente.apellido} flex={1.2} />
            <EpsCell label="NOMBRE" value={paciente.nombre} flex={1.2} />
            <EpsCell label="NACIMIENTO" value={fechaNacimientoStr} />
            <EpsCell label="SEXO" value={sexoCapitalizado} flex={0.7} />
            <EpsCell label="FECHA EXAMEN" value={fechaExamenStr} flex={1.1} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <EpsCell label="EXAMINADOR" value={examinador.nombre} flex={2} />
            <EpsCell label="CÓDIGO" value={examinador.codigo} />
          </View>
        </EpsBox>

        <EpsBox title="PRUEBAS REALIZADAS">
          {pruebas.map((prueba, index) => (
            <View key={index}>
              {prueba.tipo === 'tonal' && <AudiometryDataSection data={prueba} />}
              {prueba.tipo === 'logoaudiometria' && <LogoaudiometryPDFSection data={prueba} />}
              {prueba.tipo === 'timpanometria' && <TympanometryDataSection data={prueba} />}
            </View>
          ))}
        </EpsBox>

        {pruebas.map((prueba, index) => (
          <View key={`chart-${index}`} wrap={false} style={{ marginBottom: 6 }}>
            {prueba.tipo === 'tonal' && (
              <View>
                <Text style={styles.testTitle}>Audiometría tonal</Text>
                <PDFAudiometryChart data={prueba} />
              </View>
            )}
            {prueba.tipo === 'logoaudiometria' && (
              <View>
                <Text style={styles.testTitle}>Logoaudiometría</Text>
                <PDFLogoaudiometryChart data={prueba} />
              </View>
            )}
            {prueba.tipo === 'timpanometria' && (
              <View>
                <Text style={styles.testTitle}>Timpanometría</Text>
                <PDFTympanometryChart data={prueba} />
              </View>
            )}
          </View>
        ))}

        {pruebas.map((prueba, index) => (
          prueba.tipo === 'timpanometria' && prueba.reflejos ? (
            <View key={`reflex-${index}`} wrap={false} style={{ marginBottom: 6 }}>
              <PDFReflexGrid data={prueba} />
            </View>
          ) : null
        ))}

        <Text style={styles.footer} fixed>
          Dr. Julián Rentería, Audiólogo — Cra. 30 # 32-29 — Cel. 316 704 5684
        </Text>
      </Page>
    </Document>
  );
}

// Sección de datos de Audiometría Tonal para PDF
function AudiometryDataSection({ data }: { data: DatosAudiometriaTonal }) {
  const frequencies = ['250', '500', '1000', '2000', '3000', '4000'] as const;
  const cell = (text: string, color?: string) => (
    <View style={{ flex: 1, borderRightWidth: 0.4, borderRightColor: '#d7dce4', paddingVertical: 1, paddingHorizontal: 2 }}>
      <Text style={{ fontSize: 6.5, textAlign: 'center', color: color || '#1a2230' }}>{text}</Text>
    </View>
  );
  const row = (label: string, values: Partial<Record<string, number>> | undefined, color: string) => (
    <View style={{ flexDirection: 'row', borderTopWidth: 0.4, borderTopColor: '#d7dce4' }}>
      {cell(label, color)}
      {frequencies.map(f => cell(values?.[f] !== undefined ? String(values[f]) : '—', color))}
    </View>
  );

  return (
    <View style={{ marginBottom: 3 }}>
      <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#24306b', paddingHorizontal: 3, paddingTop: 2 }}>AUDIOMETRÍA TONAL (dB HL)</Text>
      <View style={{ flexDirection: 'row', backgroundColor: '#eef1f5' }}>
        {cell('Oído')}
        {frequencies.map(f => cell(f))}
      </View>
      {row('OD', data.oido_derecho, '#d11c1c')}
      {row('OI', data.oido_izquierdo, '#1452d1')}
    </View>
  );
}

// Sección de Logoaudiometría para PDF
function TympanometryDataSection({ data }: { data: DatosTimpanometria }) {
  const line = (label: string, side: DatosTimpanometria['derecho']) =>
    `${label}  curva ${side.tipoCurva}  ·  ${side.presionPico} daPa  ·  ${side.cumplimiento} ml${side.volumenCanalExterno !== undefined ? `  ·  vol. ${side.volumenCanalExterno} ml` : ''}`

  return (
    <View style={{ paddingHorizontal: 3, paddingVertical: 2, borderTopWidth: 0.4, borderTopColor: '#d7dce4' }}>
      <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#24306b' }}>TIMPANOMETRÍA</Text>
      <Text style={{ fontSize: 7, color: '#d11c1c' }}>{line('OD', data.derecho)}</Text>
      <Text style={{ fontSize: 7, color: '#1452d1' }}>{line('OI', data.izquierdo)}</Text>
    </View>
  )
}

function logoLine(puntos: { db: number; correctas: number }[]) {
  if (!puntos.length) return '—'
  return puntos.map(p => `${p.db} dB ${Math.round((p.correctas / 10) * 100)}%`).join('   ')
}

function LogoaudiometryPDFSection({ data }: { data: DatosLogoaudiometria }) {
  return (
    <View style={{ paddingHorizontal: 3, paddingVertical: 2, borderTopWidth: 0.4, borderTopColor: '#d7dce4' }}>
      <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#24306b' }}>LOGOAUDIOMETRÍA</Text>
      <Text style={{ fontSize: 7, color: '#d11c1c' }}>OD  {logoLine(data.puntos.derecho)}</Text>
      <Text style={{ fontSize: 7, color: '#1452d1' }}>OI  {logoLine(data.puntos.izquierdo)}</Text>
    </View>
  )
}


