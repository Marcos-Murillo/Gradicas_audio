"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { timpanometriaSchema } from "@/lib/validation-schemas";
import type { DatosTimpanometria, TipoCurvaTimpanometrica, FrecuenciaReflejo, UmbralReflejo } from "@/types/evaluation";

export interface TympanometryFormProps {
  onSubmit: (data: DatosTimpanometria) => void;
  initialData?: DatosTimpanometria;
}

const CURVE_TYPES: { value: TipoCurvaTimpanometrica; label: string }[] = [
  { value: 'A', label: 'Tipo A' },
  { value: 'P', label: 'Tipo P' },
  { value: 'B', label: 'Tipo B' },
  { value: 'C', label: 'Tipo C' },
];

const REFLEX_FREQS: FrecuenciaReflejo[] = ['500', '1000', '2000', '4000'];

// ─── Reflex table ─────────────────────────────────────────────────────────────

interface ReflexTableProps {
  label: string;
  color: string;
  ipsi: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>;
  contra: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>;
  onChangeIpsi: (f: FrecuenciaReflejo, v: UmbralReflejo | undefined) => void;
  onChangeContra: (f: FrecuenciaReflejo, v: UmbralReflejo | undefined) => void;
}

function ReflexTable({ label, color, ipsi, contra, onChangeIpsi, onChangeContra }: ReflexTableProps) {
  const parseVal = (raw: string): UmbralReflejo | undefined => {
    if (raw === '' || raw === undefined) return undefined;
    if (raw.toUpperCase() === 'NR') return null;
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color }}>{label}</p>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Tipo</th>
              {REFLEX_FREQS.map(f => (
                <th key={f} className="px-2 py-2 text-center font-medium">{f} Hz</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2 text-muted-foreground">Ipsilateral</td>
              {REFLEX_FREQS.map(f => (
                <td key={f} className="px-2 py-1 text-center">
                  <Input
                    placeholder="dB / NR"
                    defaultValue={ipsi[f] === null ? 'NR' : (ipsi[f] ?? '')}
                    onChange={(e) => onChangeIpsi(f, parseVal(e.target.value))}
                    className="h-7 w-20 text-xs text-center mx-auto"
                  />
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 text-muted-foreground">Contralateral</td>
              {REFLEX_FREQS.map(f => (
                <td key={f} className="px-2 py-1 text-center">
                  <Input
                    placeholder="dB / NR"
                    defaultValue={contra[f] === null ? 'NR' : (contra[f] ?? '')}
                    onChange={(e) => onChangeContra(f, parseVal(e.target.value))}
                    className="h-7 w-20 text-xs text-center mx-auto"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Ingresa el umbral en dB HL o escribe <strong>NR</strong> para sin respuesta.</p>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function TympanometryForm({ onSubmit, initialData }: TympanometryFormProps) {
  const [showReflejos, setShowReflejos] = useState(false);

  // Local state for reflex data (not managed by RHF since it's deeply optional)
  const [reflexOD, setReflexOD] = useState({
    ipsilateral: initialData?.reflejos?.derecho.ipsilateral ?? {} as Partial<Record<FrecuenciaReflejo, UmbralReflejo>>,
    contralateral: initialData?.reflejos?.derecho.contralateral ?? {} as Partial<Record<FrecuenciaReflejo, UmbralReflejo>>,
  });
  const [reflexOI, setReflexOI] = useState({
    ipsilateral: initialData?.reflejos?.izquierdo.ipsilateral ?? {} as Partial<Record<FrecuenciaReflejo, UmbralReflejo>>,
    contralateral: initialData?.reflejos?.izquierdo.contralateral ?? {} as Partial<Record<FrecuenciaReflejo, UmbralReflejo>>,
  });

  const form = useForm<DatosTimpanometria>({
    resolver: zodResolver(timpanometriaSchema),
    defaultValues: initialData || {
      tipo: 'timpanometria',
      derecho: { tipoCurva: undefined, presionPico: undefined, cumplimiento: undefined },
      izquierdo: { tipoCurva: undefined, presionPico: undefined, cumplimiento: undefined },
    },
  });

  const buildAndSubmit = React.useCallback((overrideRefOD = reflexOD, overrideRefOI = reflexOI) => {
    const values = form.getValues();
    const hasReflejos = showReflejos;
    const data: DatosTimpanometria = {
      ...values,
      reflejos: hasReflejos ? { derecho: overrideRefOD, izquierdo: overrideRefOI } : undefined,
    };
    const result = timpanometriaSchema.safeParse(data);
    if (result.success) onSubmit(result.data as DatosTimpanometria);
  }, [form, reflexOD, reflexOI, showReflejos, onSubmit]);

  const handleChange = React.useCallback(() => buildAndSubmit(), [buildAndSubmit]);

  const updateReflexOD = (side: 'ipsilateral' | 'contralateral', f: FrecuenciaReflejo, v: UmbralReflejo | undefined) => {
    const next = { ...reflexOD, [side]: { ...reflexOD[side], [f]: v } };
    setReflexOD(next);
    buildAndSubmit(next, reflexOI);
  };
  const updateReflexOI = (side: 'ipsilateral' | 'contralateral', f: FrecuenciaReflejo, v: UmbralReflejo | undefined) => {
    const next = { ...reflexOI, [side]: { ...reflexOI[side], [f]: v } };
    setReflexOI(next);
    buildAndSubmit(reflexOD, next);
  };

  return (
    <Form {...form}>
      <div className="space-y-6" onChange={handleChange}>

        {/* ── Timpanograma OD ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-red-600 border-b pb-1">Oído Derecho (OD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="derecho.tipoCurva" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Curva *</FormLabel>
                <Select onValueChange={(v) => { field.onChange(v); handleChange(); }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn("w-full", form.formState.errors.derecho?.tipoCurva && "border-red-500")}>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURVE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="derecho.presionPico" render={({ field }) => (
              <FormItem>
                <FormLabel>Presión Pico *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" placeholder="-400 a +200" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className={cn("pr-14", form.formState.errors.derecho?.presionPico && "border-red-500")} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">daPa</span>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="derecho.cumplimiento" render={({ field }) => (
              <FormItem>
                <FormLabel>Cumplimiento *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className={cn("pr-8", form.formState.errors.derecho?.cumplimiento && "border-red-500")} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ml</span>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="derecho.volumenCanalExterno" render={({ field }) => (
              <FormItem>
                <FormLabel>Vol. Canal Ext.</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" step="0.01" placeholder="opcional" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className="pr-8" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ml</span>
                  </div>
                </FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* ── Timpanograma OI ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-blue-600 border-b pb-1">Oído Izquierdo (OI)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="izquierdo.tipoCurva" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Curva *</FormLabel>
                <Select onValueChange={(v) => { field.onChange(v); handleChange(); }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn("w-full", form.formState.errors.izquierdo?.tipoCurva && "border-red-500")}>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURVE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="izquierdo.presionPico" render={({ field }) => (
              <FormItem>
                <FormLabel>Presión Pico *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" placeholder="-400 a +200" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className={cn("pr-14", form.formState.errors.izquierdo?.presionPico && "border-red-500")} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">daPa</span>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="izquierdo.cumplimiento" render={({ field }) => (
              <FormItem>
                <FormLabel>Cumplimiento *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" step="0.01" placeholder="0.0" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className={cn("pr-8", form.formState.errors.izquierdo?.cumplimiento && "border-red-500")} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ml</span>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name="izquierdo.volumenCanalExterno" render={({ field }) => (
              <FormItem>
                <FormLabel>Vol. Canal Ext.</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" step="0.01" placeholder="opcional" {...field} value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      className="pr-8" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ml</span>
                  </div>
                </FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* ── Reflejos Acústicos (opcional) ── */}
        <div className="space-y-3">
          <button type="button" onClick={() => setShowReflejos(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {showReflejos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Reflejos Acústicos (opcional)
            <span className="text-xs text-muted-foreground">— Ipsilateral y Contralateral por frecuencia</span>
          </button>

          {showReflejos && (
            <div className="space-y-5 pl-4 border-l-2 border-muted">
              <ReflexTable
                label="Sonda en Oído Derecho (OD)"
                color="#dc2626"
                ipsi={reflexOD.ipsilateral}
                contra={reflexOD.contralateral}
                onChangeIpsi={(f, v) => updateReflexOD('ipsilateral', f, v)}
                onChangeContra={(f, v) => updateReflexOD('contralateral', f, v)}
              />
              <ReflexTable
                label="Sonda en Oído Izquierdo (OI)"
                color="#2563eb"
                ipsi={reflexOI.ipsilateral}
                contra={reflexOI.contralateral}
                onChangeIpsi={(f, v) => updateReflexOI('ipsilateral', f, v)}
                onChangeContra={(f, v) => updateReflexOI('contralateral', f, v)}
              />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">* Tipo de curva, presión pico y cumplimiento son requeridos.</p>
      </div>
    </Form>
  );
}
