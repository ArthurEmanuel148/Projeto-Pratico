import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhamentoFamiliaPage } from './detalhamento-familia.page';

describe('DetalhamentoFamiliaPage', () => {
  let component: DetalhamentoFamiliaPage;
  let fixture: ComponentFixture<DetalhamentoFamiliaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhamentoFamiliaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
