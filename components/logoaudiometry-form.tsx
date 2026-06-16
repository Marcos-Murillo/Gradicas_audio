"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoaudiometriaSchema } from "@/lib/validation-schemas";
import { LogoaudiometryChartUI } from "@/components/logoaudiometry-chart-ui";
import type { DatosLogoaudiometria, PuntoLogoaudiometria } from "@/types/evaluation";

export interface LogoaudiometryFormProps {
  onSubmit: (data: DatosLogoaudiometria) => void;
  initialData?: DatosLogoaudiometria;
}

const TOTAL = 10; // total de palabras presentadas por nivel

function calcPct(correctas: number) {
  return Math.round((correctas / TOTAL) * 100);
}

interface EarTableProps {
  label: string;
  color: string;
  puntos: PuntoLogoaudiometria[];
  onChange: (puntos: PuntoLogoaudiometria[]) => void;
}

function EarTable({ label, color, puntos, onChange }: EarTableProps) {
  const [newDb, setNewDb] = useState<string>("");
  const [newCorrectas, setNewCorrectas] = useState<string>("");
  const [error, setError] = useState<string>("");

  const addRow = () => {
    const db = Number(newDb);
    const correctas = Number(newCorrectas);
    if (newDb === "" || isNaN(db)) { setError("Ingresa un nivel en dB"); return; }
    if (newCorrectas === "" || isNaN(correctas) || correctas < 0 || correctas > 10) {
      setError("Correctas debe ser entre 0 y 10"); return;
    }
    if (puntos.some(p => p.db === db)) { setError(`Ya existe un punto para ${db} dB`); return; }
    setError("");
    onChange([...puntos, { db, correctas }].sort((a, b) => a.db - b.db));
    setNewDb("");
    setNewCorrectas("");
  };

  const removeRow = (db: number) => onChange(puntos.filter(p => p.db !== db));

  const updateRow = (db: number, correctas: number) => {
    onChange(puntos.map(p => p.db === db ? { ...p, correctas } : p));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color }}>{label}</h3>

      {/* Table */}
      {puntos.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Nivel (dB)</th>
                <th className="px-3 py-2 text-left font-medium">Correctas / {TOTAL}</th>
                <th className="px-3 py-2 text-left font-medium">% Discriminación</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {puntos.map((p) => (
                <tr key={p.db} className="border-t">
                  <td className="px-3 py-2 font-mono">{p.db} dB</td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={p.correctas}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v) && v >= 0 && v <= 10) updateRow(p.db, v);
                      }}
                      className="h-7 w-20 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold" style={{ color }}>
                    {calcPct(p.correctas)}%
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(p.db)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add row */}
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nivel (dB)</label>
          <Input
            type="number"
            placeholder="ej. 40"
            value={newDb}
            onChange={(e) => setNewDb(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRow()}
            className="h-8 w-24 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Correctas (0–10)</label>
          <Input
            type="number"
            min={0}
            max={10}
            placeholder="ej. 7"
            value={newCorrectas}
            onChange={(e) => setNewCorrectas(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRow()}
            className="h-8 w-28 text-sm"
          />
        </div>
        {newDb && newCorrectas && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">% calculado</label>
            <div className="h-8 flex items-center px-2 text-sm font-semibold" style={{ color }}>
              {calcPct(Number(newCorrectas))}%
            </div>
          </div>
        )}
        <Button type="button" size="sm" variant="outline" onClick={addRow} className="h-8 gap-1">
          <Plus size={14} /> Agregar
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function LogoaudiometryForm({ onSubmit, initialData }: LogoaudiometryFormProps) {
  const [puntosOD, setPuntosOD] = useState<PuntoLogoaudiometria[]>(
    initialData?.puntos.derecho ?? []
  );
  const [puntosOI, setPuntosOI] = useState<PuntoLogoaudiometria[]>(
    initialData?.puntos.izquierdo ?? []
  );
  const [showEnmascarada, setShowEnmascarada] = useState<boolean>(
    !!(initialData?.puntos.derecho_enmascarado?.length || initialData?.puntos.izquierdo_enmascarado?.length)
  );
  const [puntosODm, setPuntosODm] = useState<PuntoLogoaudiometria[]>(
    initialData?.puntos.derecho_enmascarado ?? []
  );
  const [puntosOIm, setPuntosOIm] = useState<PuntoLogoaudiometria[]>(
    initialData?.puntos.izquierdo_enmascarado ?? []
  );

  const trySubmit = (
    od: PuntoLogoaudiometria[],
    oi: PuntoLogoaudiometria[],
    odm: PuntoLogoaudiometria[],
    oim: PuntoLogoaudiometria[]
  ) => {
    const data: DatosLogoaudiometria = {
      tipo: 'logoaudiometria',
      puntos: {
        derecho: od,
        izquierdo: oi,
        derecho_enmascarado: odm.length ? odm : undefined,
        izquierdo_enmascarado: oim.length ? oim : undefined,
      },
    };
    const result = logoaudiometriaSchema.safeParse(data);
    if (result.success) onSubmit(result.data);
  };

  const handleODChange = (pts: PuntoLogoaudiometria[]) => {
    setPuntosOD(pts);
    trySubmit(pts, puntosOI, puntosODm, puntosOIm);
  };

  const handleOIChange = (pts: PuntoLogoaudiometria[]) => {
    setPuntosOI(pts);
    trySubmit(puntosOD, pts, puntosODm, puntosOIm);
  };

  const handleODmChange = (pts: PuntoLogoaudiometria[]) => {
    setPuntosODm(pts);
    trySubmit(puntosOD, puntosOI, pts, puntosOIm);
  };

  const handleOImChange = (pts: PuntoLogoaudiometria[]) => {
    setPuntosOIm(pts);
    trySubmit(puntosOD, puntosOI, puntosODm, pts);
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Por cada nivel de intensidad, ingresa cuántas palabras repitió correctamente el paciente (de {TOTAL}).
        El porcentaje de discriminación se calcula automáticamente.
      </p>

      <EarTable
        label="Oído Derecho (OD)"
        color="#dc2626"
        puntos={puntosOD}
        onChange={handleODChange}
      />

      <EarTable
        label="Oído Izquierdo (OI)"
        color="#2563eb"
        puntos={puntosOI}
        onChange={handleOIChange}
      />

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowEnmascarada(v => !v)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {showEnmascarada ? "Ocultar" : "Mostrar"} Logo enmascarada (opcional)
        </button>

        {showEnmascarada && (
          <div className="space-y-6 pl-4 border-l-2 border-muted">
            <EarTable
              label="OD Enmascarada"
              color="rgba(220,38,38,0.8)"
              puntos={puntosODm}
              onChange={handleODmChange}
            />
            <EarTable
              label="OI Enmascarada"
              color="rgba(37,99,235,0.8)"
              puntos={puntosOIm}
              onChange={handleOImChange}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        * Se requiere al menos un nivel por oído. Agrega los niveles en el orden que prefieras, se ordenan automáticamente por dB.
      </p>

      {puntosOD.length > 0 && puntosOI.length > 0 && (
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <LogoaudiometryChartUI
            data={{
              tipo: "logoaudiometria",
              puntos: {
                derecho: puntosOD,
                izquierdo: puntosOI,
                derecho_enmascarado: puntosODm.length ? puntosODm : undefined,
                izquierdo_enmascarado: puntosOIm.length ? puntosOIm : undefined,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
