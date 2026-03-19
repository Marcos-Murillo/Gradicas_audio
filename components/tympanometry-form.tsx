"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { timpanometriaSchema } from "@/lib/validation-schemas";
import type { DatosTimpanometria, TipoCurvaTimpanometrica } from "@/types/evaluation";

/**
 * Props para el componente TympanometryForm
 */
export interface TympanometryFormProps {
  onSubmit: (data: DatosTimpanometria) => void;
  initialData?: DatosTimpanometria;
}

/**
 * Tipos de curva timpanométrica disponibles
 */
const CURVE_TYPES: { value: TipoCurvaTimpanometrica; label: string }[] = [
  { value: 'A', label: 'Tipo A - Normal' },
  { value: 'B', label: 'Tipo B - Plana' },
  { value: 'C', label: 'Tipo C - Presión negativa' },
  { value: 'As', label: 'Tipo As - Rígida' },
  { value: 'Ad', label: 'Tipo Ad - Hipermóvil' },
];

/**
 * Componente TympanometryForm
 * 
 * Captura datos de timpanometría para ambos oídos con validación.
 * Utiliza React Hook Form + Zod para validación.
 * 
 * Campos por oído:
 * - Tipo de curva: A, B, C, As, Ad
 * - Presión pico: en decapascales (daPa), típicamente -400 a +200
 * - Cumplimiento: en mililitros (ml), valores positivos, típicamente 0-3
 * 
 * Valida: Requirements 5.1-5.11
 */
export function TympanometryForm({ onSubmit, initialData }: TympanometryFormProps) {
  const form = useForm<DatosTimpanometria>({
    // @ts-ignore - Type compatibility issue between zod versions
    resolver: zodResolver(timpanometriaSchema),
    defaultValues: initialData || {
      tipo: 'timpanometria',
      derecho: {
        tipoCurva: undefined,
        presionPico: undefined,
        cumplimiento: undefined,
      },
      izquierdo: {
        tipoCurva: undefined,
        presionPico: undefined,
        cumplimiento: undefined,
      },
    },
  });

  // Submit on blur
  const handleBlur = React.useCallback(() => {
    const values = form.getValues();
    const result = timpanometriaSchema.safeParse(values);
    if (result.success) {
      onSubmit(result.data);
    }
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <div className="space-y-6" onBlur={handleBlur}>
        {/* Oído Derecho */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Oído Derecho (OD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Curva OD */}
            <FormField
              control={form.control}
              name="derecho.tipoCurva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Curva *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          form.formState.errors.derecho?.tipoCurva && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Presión Pico OD */}
            <FormField
              control={form.control}
              name="derecho.presionPico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presión Pico *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-14",
                          form.formState.errors.derecho?.presionPico && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        daPa
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Cumplimiento OD */}
            <FormField
              control={form.control}
              name="derecho.cumplimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cumplimiento *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        step="0.1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-10",
                          form.formState.errors.derecho?.cumplimiento && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ml
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Oído Izquierdo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Oído Izquierdo (OI)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Curva OI */}
            <FormField
              control={form.control}
              name="izquierdo.tipoCurva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Curva *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          form.formState.errors.izquierdo?.tipoCurva && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Presión Pico OI */}
            <FormField
              control={form.control}
              name="izquierdo.presionPico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presión Pico *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-14",
                          form.formState.errors.izquierdo?.presionPico && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        daPa
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Cumplimiento OI */}
            <FormField
              control={form.control}
              name="izquierdo.cumplimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cumplimiento *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        step="0.1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-10",
                          form.formState.errors.izquierdo?.cumplimiento && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ml
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          * Todos los campos son requeridos. Cumplimiento debe ser un valor positivo.
        </p>
      </div>
    </Form>
  );
}
