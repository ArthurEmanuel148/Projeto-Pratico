import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracaoDocumentosPage } from './configuracao-documentos.page';

describe('ConfiguracaoDocumentosPage', () => {
  let component: ConfiguracaoDocumentosPage;
  let fixture: ComponentFixture<ConfiguracaoDocumentosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracaoDocumentosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
