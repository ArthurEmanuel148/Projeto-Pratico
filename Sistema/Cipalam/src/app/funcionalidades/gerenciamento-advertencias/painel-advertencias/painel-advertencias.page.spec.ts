import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PainelAdvertenciasPage } from './painel-advertencias.page';

describe('PainelAdvertenciasPage', () => {
  let component: PainelAdvertenciasPage;
  let fixture: ComponentFixture<PainelAdvertenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PainelAdvertenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
