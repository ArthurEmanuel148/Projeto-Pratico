import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarAdvertenciaPage } from './criar-advertencia.page';

describe('CriarAdvertenciaPage', () => {
  let component: CriarAdvertenciaPage;
  let fixture: ComponentFixture<CriarAdvertenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarAdvertenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
