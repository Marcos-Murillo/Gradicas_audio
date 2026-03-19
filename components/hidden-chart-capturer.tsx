"use client"

import { useEffect, useRef } from 'react';
import { AudiometryChart } from '@/components/audiometry-chart';
import { LogoaudiometryChart } from '@/components/logoaudiometry-chart';
import { TympanometryChart } from '@/components/tympanometry-chart';
import type { DatosAudiometriaTonal, DatosLogoaudiometria, DatosTimpanometria } from '@/types/evaluation';

interface HiddenChartCapturerProps {
  audiometryData?: DatosAudiometriaTonal;
  logoaudiometryData?: DatosLogoaudiometria;
  tympanometryData?: DatosTimpanometria;
  onCaptured: (images: {
    audiometry?: string;
    logoaudiometry?: string;
    tympanometry?: string;
  }) => void;
}

/**
 * Componente oculto que renderiza las gráficas para capturarlas como imágenes
 * 
 * Este componente se monta temporalmente, renderiza las gráficas,
 * las captura como base64, y luego se desmonta.
 */
export function HiddenChartCapturer({
  audiometryData,
  logoaudiometryData,
  tympanometryData,
  onCaptured,
}: HiddenChartCapturerProps) {
  const audiometryRef = useRef<HTMLDivElement>(null);
  const logoaudiometryRef = useRef<HTMLDivElement>(null);
  const tympanometryRef = useRef<HTMLDivElement>(null);

  console.log('HiddenChartCapturer mounted with data:', {
    hasAudiometry: !!audiometryData,
    hasLogoaudiometry: !!logoaudiometryData,
    hasTympanometry: !!tympanometryData,
  });

  useEffect(() => {
    const captureCharts = async () => {
      // Importar dinámicamente para evitar problemas de SSR
      const { chartToImageService } = await import('@/lib/chart-to-image');
      
      // Esperar a que las gráficas se rendericen completamente
      // Aumentamos el tiempo para asegurar que Recharts termine de renderizar
      await chartToImageService.waitForRender(2000);

      const images: {
        audiometry?: string;
        logoaudiometry?: string;
        tympanometry?: string;
      } = {};

      try {
        console.log('Starting chart capture...');
        
        // Capturar audiometría
        if (audiometryData && audiometryRef.current) {
          console.log('Capturing audiometry chart...');
          images.audiometry = await chartToImageService.convertToBase64(
            audiometryRef.current,
            800,
            400
          );
          console.log('Audiometry captured:', images.audiometry.substring(0, 50));
        }

        // Capturar logoaudiometría
        if (logoaudiometryData && logoaudiometryRef.current) {
          console.log('Capturing logoaudiometry chart...');
          images.logoaudiometry = await chartToImageService.convertToBase64(
            logoaudiometryRef.current,
            800,
            400
          );
          console.log('Logoaudiometry captured:', images.logoaudiometry.substring(0, 50));
        }

        // Capturar timpanometría
        if (tympanometryData && tympanometryRef.current) {
          console.log('Capturing tympanometry chart...');
          images.tympanometry = await chartToImageService.convertToBase64(
            tympanometryRef.current,
            800,
            400
          );
          console.log('Tympanometry captured:', images.tympanometry.substring(0, 50));
        }

        console.log('All charts captured successfully');
        onCaptured(images);
      } catch (error) {
        console.error('Error capturing charts:', error);
        onCaptured({});
      }
    };

    captureCharts();
  }, [audiometryData, logoaudiometryData, tympanometryData, onCaptured]);

  console.log('HiddenChartCapturer rendering, refs:', {
    audiometryRef: !!audiometryRef.current,
    logoaudiometryRef: !!logoaudiometryRef.current,
    tympanometryRef: !!tympanometryRef.current,
  });

  return (
    <div style={{
      position: 'absolute',
      left: '-9999px',
      top: '0',
      width: '800px',
      backgroundColor: 'white',
    }}>
      {audiometryData && (
        <div ref={audiometryRef} style={{ width: '800px', height: '400px', padding: '20px', backgroundColor: 'white' }}>
          <AudiometryChart data={audiometryData} height={400} />
        </div>
      )}
      
      {logoaudiometryData && (
        <div ref={logoaudiometryRef} style={{ width: '800px', height: '400px', padding: '20px', backgroundColor: 'white' }}>
          <LogoaudiometryChart data={logoaudiometryData} height={400} />
        </div>
      )}
      
      {tympanometryData && (
        <div ref={tympanometryRef} style={{ width: '800px', height: '400px', padding: '20px', backgroundColor: 'white' }}>
          <TympanometryChart data={tympanometryData} height={400} />
        </div>
      )}
    </div>
  );
}
