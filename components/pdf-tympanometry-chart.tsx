import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, StyleSheet } from '@react-pdf/renderer';
import type { DatosTimpanometria } from '@/types/evaluation';
import { generateTympanogramCurve } from '@/lib/chart-generators';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 7 },
});

const VW = 460;
const VH = 220;
const PAD = { top: 14, right: 16, bottom: 40, left: 44 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

const X_MIN = -400;
const X_MAX = 200;
const X_TICKS = [-400, -300, -200, -100, 0, 100, 200];

interface Coord { x: number; y: number }

function toSvgX(x: number) {
  return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
}
function toSvgY(y: number, yMin: number, yMax: number) {
  return PAD.top + ((yMax - y) / (yMax - yMin)) * PLOT_H;
}

function buildPath(coords: Coord[], yMin: number, yMax: number): string {
  const pts = coords.filter(p => p.x >= X_MIN && p.x <= X_MAX).sort((a, b) => a.x - b.x);
  if (pts.length < 2) return '';
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y, yMin, yMax).toFixed(2)}`)
    .join(' ');
}

export function PDFTympanometryChart({ data }: { data: DatosTimpanometria }) {
  const curveOD = generateTympanogramCurve(
    data.derecho.tipoCurva, data.derecho.presionPico, data.derecho.cumplimiento
  );
  const curveOI = generateTympanogramCurve(
    data.izquierdo.tipoCurva, data.izquierdo.presionPico, data.izquierdo.cumplimiento
  );

  const coordsOD: Coord[] = curveOD.map(p => ({ x: p.presion, y: p.cumplimiento }));
  const coordsOI: Coord[] = curveOI.map(p => ({ x: p.presion, y: p.cumplimiento }));

  // Adaptive Y axis based on actual curve data
  const allY = [...coordsOD, ...coordsOI].map(p => p.y);
  const yMin = 0;
  const yMax = Math.ceil(Math.max(...allY) * 1.2 * 10) / 10;

  const yTicks = Array.from({ length: 7 }, (_, i) =>
    parseFloat((yMin + (i / 6) * (yMax - yMin)).toFixed(2))
  );

  const pathOD = buildPath(coordsOD, yMin, yMax);
  const pathOI = buildPath(coordsOI, yMin, yMax);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timpanograma</Text>

      <Svg width={VW} height={VH}>
        {/* Plot background */}
        <Path
          d={`M ${PAD.left} ${PAD.top} h ${PLOT_W} v ${PLOT_H} h ${-PLOT_W} Z`}
          fill="white" stroke="#555" strokeWidth={0.8}
        />

        {/* Vertical grid */}
        {X_TICKS.map(x => (
          <Line key={`vg-${x}`}
            x1={toSvgX(x)} y1={PAD.top}
            x2={toSvgX(x)} y2={PAD.top + PLOT_H}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Horizontal grid */}
        {yTicks.map(y => (
          <Line key={`hg-${y}`}
            x1={PAD.left} y1={toSvgY(y, yMin, yMax)}
            x2={PAD.left + PLOT_W} y2={toSvgY(y, yMin, yMax)}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Series OD */}
        {pathOD ? <Path d={pathOD} fill="none" stroke="#cc0000" strokeWidth={1.8} /> : null}

        {/* Series OI */}
        {pathOI ? <Path d={pathOI} fill="none" stroke="#0000cc" strokeWidth={1.8} /> : null}

        {/* Peak dots */}
        <Circle
          cx={toSvgX(data.derecho.presionPico)}
          cy={toSvgY(data.derecho.cumplimiento, yMin, yMax)}
          r={4} fill="#cc0000" stroke="white" strokeWidth={1}
        />
        <Circle
          cx={toSvgX(data.izquierdo.presionPico)}
          cy={toSvgY(data.izquierdo.cumplimiento, yMin, yMax)}
          r={4} fill="#0000cc" stroke="white" strokeWidth={1}
        />

        {/* X ticks + labels */}
        {X_TICKS.map(x => (
          <G key={`xt-${x}`}>
            <Line x1={toSvgX(x)} y1={PAD.top + PLOT_H} x2={toSvgX(x)} y2={PAD.top + PLOT_H + 4} stroke="#555" strokeWidth={0.6} />
            <Text x={toSvgX(x)} y={PAD.top + PLOT_H + 12} style={{ fontSize: 6, textAnchor: 'middle', fill: '#444' }}>{x}</Text>
          </G>
        ))}

        {/* X axis label */}
        <Text x={PAD.left + PLOT_W / 2} y={VH - 6}
          style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}
        >
          Presión (daPa)
        </Text>

        {/* Y ticks + labels */}
        {yTicks.map(y => (
          <G key={`yt-${y}`}>
            <Line x1={PAD.left - 4} y1={toSvgY(y, yMin, yMax)} x2={PAD.left} y2={toSvgY(y, yMin, yMax)} stroke="#555" strokeWidth={0.6} />
            <Text x={PAD.left - 6} y={toSvgY(y, yMin, yMax) + 2} style={{ fontSize: 6, textAnchor: 'end', fill: '#444' }}>{y}</Text>
          </G>
        ))}

        {/* Y axis label */}
        <Text x={10} y={PAD.top + PLOT_H / 2}
          style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}
        >
          Cumplimiento (ml)
        </Text>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}>
            <Line x1={0} y1={4} x2={24} y2={4} stroke="#cc0000" strokeWidth={2} />
          </Svg>
          <Text style={styles.legendText}>
            OD — Tipo {data.derecho.tipoCurva} | {data.derecho.presionPico} daPa | {data.derecho.cumplimiento} ml
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}>
            <Line x1={0} y1={4} x2={24} y2={4} stroke="#0000cc" strokeWidth={2} />
          </Svg>
          <Text style={styles.legendText}>
            OI — Tipo {data.izquierdo.tipoCurva} | {data.izquierdo.presionPico} daPa | {data.izquierdo.cumplimiento} ml
          </Text>
        </View>
      </View>
    </View>
  );
}
