import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, StyleSheet } from '@react-pdf/renderer';
import type { DatosLogoaudiometria } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 7 },
});

const VW = 460, VH = 220;
const PAD = { top: 14, right: 16, bottom: 40, left: 40 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;
const X_MIN = 0, X_MAX = 100, Y_MAX = 100;

function toSvgX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W; }
function toSvgY(y: number) { return PAD.top + ((Y_MAX - y) / Y_MAX) * PLOT_H; }

const TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function buildPath(pts: { x: number; y: number }[]): string {
  const sorted = [...pts].sort((a, b) => a.x - b.x);
  if (sorted.length < 2) return '';
  return sorted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`).join(' ');
}

export function PDFLogoaudiometryChart({ data }: { data: DatosLogoaudiometria }) {
  const ptsOD = data.puntos.derecho.map(p => ({ x: p.db, y: Math.round((p.correctas / 10) * 100) }));
  const ptsOI = data.puntos.izquierdo.map(p => ({ x: p.db, y: Math.round((p.correctas / 10) * 100) }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>
      <Svg width={VW} height={VH}>
        <Path d={`M ${PAD.left} ${PAD.top} h ${PLOT_W} v ${PLOT_H} h ${-PLOT_W} Z`} fill="white" stroke="#555" strokeWidth={0.8} />

        {TICKS.map(v => (
          <G key={v}>
            <Line x1={toSvgX(v)} y1={PAD.top} x2={toSvgX(v)} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={0.5} />
            <Line x1={PAD.left} y1={toSvgY(v)} x2={PAD.left + PLOT_W} y2={toSvgY(v)} stroke="#e5e7eb" strokeWidth={0.5} />
          </G>
        ))}

        {buildPath(ptsOD) ? <Path d={buildPath(ptsOD)} fill="none" stroke="#cc0000" strokeWidth={1.8} /> : null}
        {buildPath(ptsOI) ? <Path d={buildPath(ptsOI)} fill="none" stroke="#0000cc" strokeWidth={1.8} /> : null}

        {ptsOD.map((p, i) => <Circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={3} fill="#cc0000" />)}
        {ptsOI.map((p, i) => <Circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={3} fill="#0000cc" />)}

        {TICKS.map(x => (
          <G key={`x-${x}`}>
            <Line x1={toSvgX(x)} y1={PAD.top + PLOT_H} x2={toSvgX(x)} y2={PAD.top + PLOT_H + 4} stroke="#555" strokeWidth={0.6} />
            <Text x={toSvgX(x)} y={PAD.top + PLOT_H + 12} style={{ fontSize: 6, textAnchor: 'middle', fill: '#444' }}>{x}</Text>
          </G>
        ))}
        <Text x={PAD.left + PLOT_W / 2} y={VH - 6} style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}>Intensidad (dB)</Text>

        {TICKS.map(y => (
          <G key={`y-${y}`}>
            <Line x1={PAD.left - 4} y1={toSvgY(y)} x2={PAD.left} y2={toSvgY(y)} stroke="#555" strokeWidth={0.6} />
            <Text x={PAD.left - 6} y={toSvgY(y) + 2} style={{ fontSize: 6, textAnchor: 'end', fill: '#444' }}>{y}</Text>
          </G>
        ))}
        <Text x={10} y={PAD.top + PLOT_H / 2} style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}>Discriminación (%)</Text>
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#cc0000" strokeWidth={2} /></Svg>
          <Text style={styles.legendText}>OD (Oído Derecho)</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#0000cc" strokeWidth={2} /></Svg>
          <Text style={styles.legendText}>OI (Oído Izquierdo)</Text>
        </View>
      </View>
    </View>
  );
}
