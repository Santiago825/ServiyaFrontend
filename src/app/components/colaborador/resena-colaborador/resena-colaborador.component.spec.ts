import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenaColaboradorComponent } from './resena-colaborador.component';

describe('ResenaColaboradorComponent', () => {
  let component: ResenaColaboradorComponent;
  let fixture: ComponentFixture<ResenaColaboradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResenaColaboradorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResenaColaboradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
