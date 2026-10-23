import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoColaboradorComponent } from './contrato-colaborador.component';

describe('ContratoColaboradorComponent', () => {
  let component: ContratoColaboradorComponent;
  let fixture: ComponentFixture<ContratoColaboradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratoColaboradorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratoColaboradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
