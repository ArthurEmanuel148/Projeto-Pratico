import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TiposDocumentoPage } from './tipos-documento.page';

describe('TiposDocumentoPage', () => {
  let component: TiposDocumentoPage;
  let fixture: ComponentFixture<TiposDocumentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposDocumentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
