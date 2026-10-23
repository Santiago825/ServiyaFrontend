import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PersonaRanking } from 'src/app/models/persona-ranking';
import { PersonaService } from 'src/app/services/Persona/persona.service';
import { fotoSrc } from 'src/app/shared/utils/foto';
import { Servicio } from 'src/app/models/servicio';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  serviceQuery: string = '';
  locationQuery: string = '';
  @Output() search = new EventEmitter<{ service: string; location: string }>();

  /** Colaboradores mejor valorados (GET obtener_personas_raiting). Antes eran datos de ejemplo fijos. */
  profesionales: PersonaRanking[] = [];
  categorias: Servicio[] = [];


  constructor(private personaService: PersonaService, private router: Router,private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    this.personaService.obtenerRanking().subscribe({
      next: (lista) => (this.profesionales = lista),
      error: () => (this.profesionales = []),
    });
    this.serviciosService.obtenerMasUsados().subscribe({
    next: (lista) => (this.categorias = lista),
    error: () => (this.categorias = []),
  });
  }
  fotoSrc(foto: string | null): string {
    return fotoSrc(foto) as string;
  }

  /** La búsqueda real (por servicio y municipio) está en la pantalla de servicios. */
  onSearch(): void {
    this.router.navigate(['/servicios']);
  }
}
