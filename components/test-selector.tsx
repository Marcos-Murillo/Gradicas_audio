'use client';

import { TipoPrueba } from '@/types/evaluation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface TestSelectorProps {
  selectedTests: TipoPrueba[];
  onAddTest: (test: TipoPrueba) => void;
  onRemoveTest: (test: TipoPrueba) => void;
}

interface TestCardInfo {
  tipo: TipoPrueba;
  titulo: string;
  descripcion: string;
}

const availableTests: TestCardInfo[] = [
  {
    tipo: 'tonal',
    titulo: 'Audiometría Tonal',
    descripcion: 'Evaluación de la capacidad auditiva a diferentes frecuencias',
  },
  {
    tipo: 'logoaudiometria',
    titulo: 'Logoaudiometría',
    descripcion: 'Evaluación del reconocimiento verbal y discriminación del habla',
  },
  {
    tipo: 'timpanometria',
    titulo: 'Timpanometría',
    descripcion: 'Evaluación de la función del oído medio',
  },
];

export function TestSelector({ selectedTests, onAddTest, onRemoveTest }: TestSelectorProps) {
  const isTestSelected = (test: TipoPrueba) => selectedTests.includes(test);
  const canAddMoreTests = selectedTests.length < 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Seleccionar Pruebas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableTests.map((test) => {
            const isSelected = isTestSelected(test.tipo);
            const isDisabled = isSelected || !canAddMoreTests;

            return (
              <Card
                key={test.tipo}
                className={`transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : isDisabled
                    ? 'opacity-50'
                    : 'hover:border-primary/50'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{test.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{test.descripcion}</p>
                  <Button
                    onClick={() => onAddTest(test.tipo)}
                    disabled={isDisabled}
                    className="w-full"
                    variant={isSelected ? 'secondary' : 'default'}
                  >
                    {isSelected ? 'Seleccionada' : 'Añadir Prueba'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedTests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Pruebas Seleccionadas</h3>
          <div className="space-y-2">
            {selectedTests.map((test) => {
              const testInfo = availableTests.find((t) => t.tipo === test);
              return (
                <div
                  key={test}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <span className="font-medium">{testInfo?.titulo}</span>
                  <Button
                    onClick={() => onRemoveTest(test)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Eliminar {testInfo?.titulo}</span>
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedTests.length} de 3 pruebas seleccionadas
          </p>
        </div>
      )}
    </div>
  );
}
