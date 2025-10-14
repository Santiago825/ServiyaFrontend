import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  serviceQuery: string = '';
  locationQuery: string = '';

  @Output() search = new EventEmitter<{ service: string, location: string }>();

  constructor() { }
  professionals = [
    {
      nombre: 'Ana López',
      municipio: 'Bogotá',
      servicio: 'Limpieza',
      img: 'assets/images/ana-lopez-1.jpg',
      rating: 5
    },
    {
      nombre: 'Ana López',
      municipio: 'Medellín',
      servicio: 'Electricista',
      img: 'assets/images/ana-lopez-2.jpg',
      rating: 3.5
    },
    {
      nombre: 'Carlos Pérez',
      municipio: 'Soacha',
      servicio: 'Cocinero',
      img: 'assets/images/cocineros.jpg',
      rating: 5
    },
    {
      nombre: 'Laura Gómez',
      municipio: 'Socha',
      servicio: 'Informática',
      img: 'assets/images/informatica.jpg',
      rating: 3
    }
  ];

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('fas fa-star'); // estrella llena
      } else if (i === fullStars && hasHalfStar) {
        stars.push('fas fa-star-half-alt'); // media estrella
      } else {
        stars.push('far fa-star'); // estrella vacía
      }
    }

    return stars;
  }

  onSearch() {
    alert("hola")
  }
}
