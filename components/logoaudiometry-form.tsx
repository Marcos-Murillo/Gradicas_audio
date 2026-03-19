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
import { cn } from "@/lib/utils";
import { logoaudiometriaSchema } from "@/lib/validation-schemas";
import type { DatosLogoaudiometria } from "@/types/evaluation";

/**
 * Props para el componente LogoaudiometryForm
 */
export interface LogoaudiometryFormProps {
  onSubmit: (data: DatosLogoaudiometria) => void;
  initialData?: DatosLogoaudiometria;
}

/**
 * Componente LogoaudiometryForm
 * 
 * Captura datos de logoaudiometría (reconocimiento verbal) para ambos oídos.
 * Utiliza React Hook Form + Zod para validación.
 * 
 * Campos:
 * - SRT (Speech Reception Threshold): Umbral de recepción del habla en dB
 * - SDS (Speech Discrimination Score): Puntuación de discriminación del habla en %
 * 
 * Valida: Requirements 4.1-4.8
 */
export function LogoaudiometryForm({ onSubmit, initialData }: LogoaudiometryFormProps) {
  const form = useForm<DatosLogoaudiometria>({
    // @ts-ignore - Type compatibility issue between zod versions
    resolver: zodResolver(logoaudiometriaSchema),
    defaultValues: initialData || {
      tipo: 'logoaudiometria',
      srt: {
        derecho: undefined,
        izquierdo: undefined,
      },
      sds: {
        derecho: undefined,
        izquierdo: undefined,
      },
    },
  });

  // Submit on blur
  const handleBlur = React.useCallback(() => {
    const values = form.getValues();
    const result = logoaudiometriaSchema.safeParse(values);
    if (result.success) {
      onSubmit(result.data);
    }
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <div className="space-y-6" onBlur={handleBlur}>
        {/* SRT - Speech Reception Threshold */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SRT - Umbral de Recepción del Habla</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SRT Oído Derecho */}
            <FormField
              control={form.control}
              name="srt.derecho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SRT Oído Derecho (OD) *</FormLabel>
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
                          "pr-10",
                          form.formState.errors.srt?.derecho && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        dB
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* SRT Oído Izquierdo */}
            <FormField
              control={form.control}
              name="srt.izquierdo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SRT Oído Izquierdo (OI) *</FormLabel>
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
                          "pr-10",
                          form.formState.errors.srt?.izquierdo && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        dB
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SDS - Speech Discrimination Score */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SDS - Puntuación de Discriminación del Habla</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SDS Oído Derecho */}
            <FormField
              control={form.control}
              name="sds.derecho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SDS Oído Derecho (OD) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        min={0}
                        max={100}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-10",
                          form.formState.errors.sds?.derecho && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* SDS Oído Izquierdo */}
            <FormField
              control={form.control}
              name="sds.izquierdo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SDS Oído Izquierdo (OI) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ingrese valor"
                        min={0}
                        max={100}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        className={cn(
                          "pr-10",
                          form.formState.errors.sds?.izquierdo && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
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
          * Todos los campos son requeridos. SDS debe estar entre 0 y 100%.
        </p>
      </div>
    </Form>
  );
}
