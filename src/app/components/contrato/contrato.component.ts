import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

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
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 0.5 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ContratoComponent {

  // Lista de contratos de ejemplo
  contracts = [
    {
      projectTitle: 'Remodelación de Cocina',
      collaborator: 'Ana Plomería',
      startDate: '2025-10-01',
      endDate: '2025-10-15',
      address: 'Calle 123 #45-67',
      description: 'Remodelación completa de cocina con muebles nuevos.',
      price: 1500000,
      attachments: 'contrato1.pdf'
    },
    {
      projectTitle: 'Pintura de Oficina',
      collaborator: 'Sofía Pintora',
      startDate: '2025-11-01',
      endDate: '2025-11-05',
      address: 'Carrera 10 #20-30',
      description: 'Pintura completa de oficina, paredes y techos.',
      price: 800000,
      attachments: 'contrato2.pdf'
    }
  ];

  // Modal
  showContractModal = false;
  selectedContract: any = null;

  // Abrir modal con la información del contrato
  openContractModal(contract: any) {
    this.selectedContract = contract;
    this.showContractModal = true;
  }

  // Cerrar modal
  closeContractModal() {
    this.showContractModal = false;
    this.selectedContract = null;
  }

  // Función opcional para descargar contrato
  downloadContract() {
    if (this.selectedContract?.attachments) {
      const link = document.createElement('a');
      link.href = `/assets/contratos/${this.selectedContract.attachments}`;
      link.download = this.selectedContract.attachments;
      link.click();
    }
  }
}
