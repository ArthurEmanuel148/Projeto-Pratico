import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardResponsavelPage } from './dashboard-responsavel.page';

describe('DashboardResponsavelPage', () => {
  let component: DashboardResponsavelPage;
  let fixture: ComponentFixture<DashboardResponsavelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardResponsavelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
