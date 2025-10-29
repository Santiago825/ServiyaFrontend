import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { ContratoService } from 'src/app/services/Contrato/contrato.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Contrato } from 'src/app/models/contrato';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CONSTANTES } from 'src/app/constants/constants';

@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.css'],
  animations: [
    trigger('fadeZoom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 0.5 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ContratoComponent {
  contratos: Contrato[] = [];
  showContractModal = false;
  selectedContract: any = null;

  constructor(
    private contratoService: ContratoService,
    private authService: AuthService,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.obtenerContrato();
  }

  obtenerContrato() {
    const { idUsuario } = this.authService.getUser();

    this.loader.start();

    this.contratoService.obtenerContrato(idUsuario).subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.contratos = resp['lista'] || [];
        }
      },
      error: (error) => {
        console.error('Error al obtener contratos:', error);
      },
      complete: () => {
        this.loader.stop();
      },
    });
  }
  obtenerContratoDetalle(idContrato: number) {
    this.loader.start();

    this.contratoService.obtenerDetalleContrato(idContrato).subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.selectedContract = resp['lista'][0];
        }
      },
      error: (error) => {},
      complete: () => {
        this.loader.stop();
      },
    });
  }

  openContractModal(contrato: any) {
    this.showContractModal = true;
    this.obtenerContratoDetalle(contrato.idContrato);
  }

  closeContractModal() {
    this.showContractModal = false;
    this.selectedContract = null;
  }

  downloadContract(idContrato: number) {
        this.loader.start();
    this.contratoService.obtenerArchivoContrato(idContrato).subscribe({
      next: (resp) => {
        const contrato = resp['lista'][0];
        if (!contrato?.contenidoBase64) return;

        const byteArray = Uint8Array.from(atob(contrato.contenidoBase64), (char) =>
          char.charCodeAt(0)
        );
        const blob = new Blob([byteArray], { type: contrato.tipoContenido});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${contrato.nombre}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error:(error)=>{

      },
      complete:()=>{
        this.loader.stop();
      }
    });
  }
  base64ToImage(base64: string): string {
  // Asegura que el string tenga el encabezado correcto
  if (!base64.startsWith('data:image')) {
    base64 = 'data:image/png;base64,' + base64;
  }
  return base64;
}
}
