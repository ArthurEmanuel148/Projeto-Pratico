import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioMatriculaPage } from './inicio-matricula.page';

describe('InicioMatriculaPage', () => {
  let component: InicioMatriculaPage;
  let fixture: ComponentFixture<InicioMatriculaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioMatriculaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
