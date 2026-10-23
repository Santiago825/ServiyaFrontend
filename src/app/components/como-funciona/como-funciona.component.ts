import { Component } from '@angular/core';


interface Step {
  id: number;
  icon: string; 
  title: string;
  description: string;
}

@Component({
  selector: 'app-como-funciona',
  templateUrl: './como-funciona.component.html',
  styleUrls: ['./como-funciona.component.css']
})

export class ComoFuncionaComponent {


   steps: Step[] = [
    {
      id: 1,
      icon: 'fas fa-search', // Usando emojis simples para este ejemplo
      title: 'Busca y Especifica tu Necesidad',
      description: 'Utiliza nuestra barra de búsqueda inteligente. Describe el servicio (ej. "Electricista para corto circuito") y la ubicación exacta. Sé detallado para un mejor *matching*.'
    },
    {
      id: 2,
      icon: 'fas fa-user-check',
      title: 'Compara Perfiles y Chatea',
      description: 'Revisa los perfiles de los profesionales disponibles, compara sus calificaciones, tarifas y reseñas. Inicia un chat instantáneo para negociar el precio y confirmar los detalles antes de contratar.'
    },
    {
      id: 3,
      icon: 'fas fa-calendar-check',
      title: 'Contrata y Disfruta el Servicio',
      description: 'Una vez que estés de acuerdo, acepta la cotización a través de la plataforma. El profesional realizará el trabajo. Solo pagas cuando el servicio esté completado.'
    },
    {
      id: 4,
      icon: 'fas fa-thumbs-up',
      title: 'Califica al Profesional',
      description: 'Tu opinión es vital. Después de finalizar el servicio, califica el trabajo y la atención recibida. Esto ayuda a mantener la calidad de nuestra comunidad ServiYa.'
    }
  ];


  
}
