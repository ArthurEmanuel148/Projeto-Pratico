import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhamentoAlunoPage } from './detalhamento-aluno.page';

describe('DetalhamentoAlunoPage', () => {
  let component: DetalhamentoAlunoPage;
  let fixture: ComponentFixture<DetalhamentoAlunoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhamentoAlunoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
