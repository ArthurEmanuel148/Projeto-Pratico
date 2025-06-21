import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaDeclaracoesPage } from './lista-declaracoes.page';

describe('ListaDeclaracoesPage', () => {
  let component: ListaDeclaracoesPage;
  let fixture: ComponentFixture<ListaDeclaracoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDeclaracoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
