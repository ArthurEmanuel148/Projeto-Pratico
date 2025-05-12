import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PainelFuncionarioPage } from './painel-funcionario.page';

describe('PainelFuncionarioPage', () => {
  let component: PainelFuncionarioPage;
  let fixture: ComponentFixture<PainelFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PainelFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
