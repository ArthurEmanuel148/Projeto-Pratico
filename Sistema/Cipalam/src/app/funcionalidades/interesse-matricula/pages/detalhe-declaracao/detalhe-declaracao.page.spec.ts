import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalheDeclaracaoPage } from './detalhe-declaracao.page';

describe('DetalheDeclaracaoPage', () => {
  let component: DetalheDeclaracaoPage;
  let fixture: ComponentFixture<DetalheDeclaracaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalheDeclaracaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
