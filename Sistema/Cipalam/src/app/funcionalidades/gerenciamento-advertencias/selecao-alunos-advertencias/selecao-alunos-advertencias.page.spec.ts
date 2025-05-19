import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelecaoAlunosAdvertenciasPage } from './selecao-alunos-advertencias.page';

describe('SelecaoAlunosAdvertenciasPage', () => {
  let component: SelecaoAlunosAdvertenciasPage;
  let fixture: ComponentFixture<SelecaoAlunosAdvertenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecaoAlunosAdvertenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
