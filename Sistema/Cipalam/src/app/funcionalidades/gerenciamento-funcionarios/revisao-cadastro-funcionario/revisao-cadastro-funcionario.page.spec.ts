import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevisaoCadastroFuncionarioPage } from './revisao-cadastro-funcionario.page';

describe('RevisaoCadastroFuncionarioPage', () => {
  let component: RevisaoCadastroFuncionarioPage;
  let fixture: ComponentFixture<RevisaoCadastroFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisaoCadastroFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
