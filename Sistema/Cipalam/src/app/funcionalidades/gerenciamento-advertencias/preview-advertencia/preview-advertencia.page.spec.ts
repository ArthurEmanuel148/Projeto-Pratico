import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewAdvertenciaPage } from './preview-advertencia.page';

describe('PreviewAdvertenciaPage', () => {
  let component: PreviewAdvertenciaPage;
  let fixture: ComponentFixture<PreviewAdvertenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewAdvertenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
