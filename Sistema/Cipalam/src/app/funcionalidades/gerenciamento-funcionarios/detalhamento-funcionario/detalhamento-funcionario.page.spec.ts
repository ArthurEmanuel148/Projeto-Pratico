import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhamentoFuncionarioPage } from './detalhamento-funcionario.page';

describe('DetalhamentoFuncionarioPage', () => {
  let component: DetalhamentoFuncionarioPage;
  let fixture: ComponentFixture<DetalhamentoFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhamentoFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
