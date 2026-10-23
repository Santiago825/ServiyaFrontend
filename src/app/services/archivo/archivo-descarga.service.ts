import { Injectable } from '@angular/core';
import { ArchivoDescargable } from 'src/app/models/archivo';

/** Descarga en el navegador un archivo recibido en base64. Estaba copiado en dos componentes. */
@Injectable({ providedIn: 'root' })
export class ArchivoDescargaService {
  descargar(archivo: ArchivoDescargable): void {
    if (!archivo.contenidoBase64) {
      return;
    }
    const bytes = Uint8Array.from(atob(archivo.contenidoBase64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: archivo.tipoContenido }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = archivo.nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
