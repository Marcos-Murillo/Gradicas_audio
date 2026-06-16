import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, StyleSheet } from '@react-pdf/renderer';
import type { DatosLogoaudiometria, PuntoLogoaudiometria } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 7 },
});

const VW = 460;
const VH = 240;
const PAD = { top: 14, right: 16, bottom: 40, left: 44 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;
const Y_MAX = 100;

type Pt = { x: number; y: number };

function toPts(puntos: PuntoLogoaudiometria[]): Pt[] {
  return puntos
    .map(p => ({ x: Number(p.db), y: Math.round((Number(p.correctas) / 10) * 100) }))
    .filter(p => !Number.isNaN(p.x) && !Number.isNaN(p.y))
    .sort((a, b) => a.x - b.x);
}

function computeXRange(all: Pt[]): { xMin: number; xMax: number } {
  if (all.length === 0) return { xMin: 0, xMax: 100 };
  const xs = all.map(p => p.x);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const pad = Math.max(10, Math.round((max - min) * 0.15));
  return {
    xMin: Math.max(0, Math.floor((min - pad) / 10) * 10),
    xMax: Math.ceil((max + pad) / 10) * 10,
  };
}

function toSvgX(x: number, xMin: number, xMax: number) {
  return PAD.left + ((x - xMin) / (xMax - xMin)) * PLOT_W;
}
function toSvgY(y: number) {
  return PAD.top + ((Y_MAX - y) / Y_MAX) * PLOT_H;
}

function buildPath(pts: Pt[], xMin: number, xMax: number): string {
  if (pts.length < 2) return '';
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x, xMin, xMax).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`)
    .join(' ');
}

function xTicks(xMin: number, xMax: number): number[] {
  const step = xMax - xMin <= 40 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = xMin; v <= xMax; v += step) ticks.push(v);
  return ticks;
}

const Y_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function PDFLogoaudiometryChart({ data }: { data: DatosLogoaudiometria }) {
  const ptsOD = toPts(data.puntos.derecho ?? []);
  const ptsOI = toPts(data.puntos.izquierdo ?? []);
  const ptsODm = toPts(data.puntos.derecho_enmascarado ?? []);
  const ptsOIm = toPts(data.puntos.izquierdo_enmascarado ?? []);

  const all = [...ptsOD, ...ptsOI, ...ptsODm, ...ptsOIm];
  if (all.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>
        <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>Sin datos para graficar</Text>
      </View>
    );
  }

  const { xMin, xMax } = computeXRange(all);
  const xTickValues = xTicks(xMin, xMax);
  const hasMasked = ptsODm.length > 0 || ptsOIm.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>
      <Svg width={VW} height={VH}>
        <Path d={`M ${PAD.left} ${PAD.top} h ${PLOT_W} v ${PLOT_H} h ${-PLOT_W} Z`} fill="white" stroke="#555" strokeWidth={0.8} />

        {xTickValues.map(v => (
          <G key={`gx-${v}`}>
            <Line x1={toSvgX(v, xMin, xMax)} y1={PAD.top} x2={toSvgX(v, xMin, xMax)} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={0.5} />
          </G>
        ))}
        {Y_TICKS.map(v => (
          <G key={`gy-${v}`}>
            <Line x1={PAD.left} y1={toSvgY(v)} x2={PAD.left + PLOT_W} y2={toSvgY(v)} stroke="#e5e7eb" strokeWidth={0.5} />
          </G>
        ))}

        {buildPath(ptsOD, xMin, xMax) ? <Path d={buildPath(ptsOD, xMin, xMax)} fill="none" stroke="#cc0000" strokeWidth={1.8} /> : null}
        {buildPath(ptsOI, xMin, xMax) ? <Path d={buildPath(ptsOI, xMin, xMax)} fill="none" stroke="#0000cc" strokeWidth={1.8} /> : null}
        {hasMasked && buildPath(ptsODm, xMin, xMax) ? (
          <Path d={buildPath(ptsODm, xMin, xMax)} fill="none" stroke="#cc0000" strokeWidth={1.4} strokeDasharray="3,2" />
        ) : null}
        {hasMasked && buildPath(ptsOIm, xMin, xMax) ? (
          <Path d={buildPath(ptsOIm, xMin, xMax)} fill="none" stroke="#0000cc" strokeWidth={1.4} strokeDasharray="3,2" />
        ) : null}

        {ptsOD.map((p, i) => <Circle key={`od-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={3} fill="#cc0000" />)}
        {ptsOI.map((p, i) => <Circle key={`oi-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={3} fill="#0000cc" />)}
        {hasMasked && ptsODm.map((p, i) => <Circle key={`odm-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={2.4} fill="#cc0000" />)}
        {hasMasked && ptsOIm.map((p, i) => <Circle key={`oim-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={2.4} fill="#0000cc" />)}

        {xTickValues.map(x => (
          <G key={`xt-${x}`}>
            <Line x1={toSvgX(x, xMin, xMax)} y1={PAD.top + PLOT_H} x2={toSvgX(x, xMin, xMax)} y2={PAD.top + PLOT_H + 4} stroke="#555" strokeWidth={0.6} />
            <Text x={toSvgX(x, xMin, xMax)} y={PAD.top + PLOT_H + 12} style={{ fontSize: 6, textAnchor: 'middle', fill: '#444' }}>{x}</Text>
          </G>
        ))}
        <Text x={PAD.left + PLOT_W / 2} y={VH - 6} style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}>Intensidad (dB)</Text>

        {Y_TICKS.filter((_, i) => i % 2 === 0).map(y => (
          <G key={`yt-${y}`}>
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
        {hasMasked && (
          <>
            <View style={styles.legendItem}>
              <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#cc0000" strokeWidth={1.6} strokeDasharray="3,2" /></Svg>
              <Text style={styles.legendText}>OD Enmasc.</Text>
            </View>
            <View style={styles.legendItem}>
              <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#0000cc" strokeWidth={1.6} strokeDasharray="3,2" /></Svg>
              <Text style={styles.legendText}>OI Enmasc.</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
