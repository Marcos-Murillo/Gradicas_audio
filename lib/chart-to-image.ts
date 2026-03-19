import domtoimage from 'dom-to-image-more';

/**
 * Servicio para convertir gráficas a imágenes base64
 * 
 * Captura elementos del DOM (gráficas de Recharts) y los convierte a imágenes PNG en base64
 * para ser usadas en PDFs generados con @react-pdf/renderer
 */
export class ChartToImageService {
  /**
   * Convierte un elemento HTML (gráfica) a imagen base64
   * 
   * @param element - El elemento HTML que contiene la gráfica
   * @param width - Ancho deseado de la imagen (opcional)
   * @param height - Alto deseado de la imagen (opcional)
   * @returns Promise con la imagen en formato base64 (data URL)
   */
  async convertToBase64(
    element: HTMLElement,
    width?: number,
    height?: number
  ): Promise<string> {
    try {
      const options: any = {
        quality: 1.0,
        bgcolor: '#ffffff',
        style: {
          transform: 'scale(2)', // Alta calidad
          transformOrigin: 'top left',
        }
      };

      if (width) options.width = width * 2;
      if (height) options.height = height * 2;

      const dataUrl = await domtoimage.toPng(element, options) as unknown as string;
      return dataUrl;
    } catch (error) {
      console.error('Error converting chart to image:', error);
      throw new Error('Error al convertir la gráfica a imagen');
    }
  }

  /**
   * Espera a que un elemento esté completamente renderizado
   * Útil para asegurar que las gráficas de Recharts estén listas
   * 
   * @param ms - Milisegundos a esperar
   */
  async waitForRender(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chartToImageService = new ChartToImageService();
