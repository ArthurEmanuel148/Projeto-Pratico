import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PermicoesFuncionarioComponent } from './permicoes-funcionario.component';

describe('PermicoesFuncionarioComponent', () => {
  let component: PermicoesFuncionarioComponent;
  let fixture: ComponentFixture<PermicoesFuncionarioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PermicoesFuncionarioComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PermicoesFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
