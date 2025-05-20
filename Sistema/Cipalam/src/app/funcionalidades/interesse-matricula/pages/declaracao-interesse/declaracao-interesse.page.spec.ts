import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeclaracaoInteressePage } from './declaracao-interesse.page';

describe('DeclaracaoInteressePage', () => {
  let component: DeclaracaoInteressePage;
  let fixture: ComponentFixture<DeclaracaoInteressePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeclaracaoInteressePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
