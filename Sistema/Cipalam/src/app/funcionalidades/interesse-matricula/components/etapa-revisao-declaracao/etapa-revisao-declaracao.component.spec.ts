import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EtapaRevisaoDeclaracaoComponent } from './etapa-revisao-declaracao.component';

describe('EtapaRevisaoDeclaracaoComponent', () => {
  let component: EtapaRevisaoDeclaracaoComponent;
  let fixture: ComponentFixture<EtapaRevisaoDeclaracaoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EtapaRevisaoDeclaracaoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EtapaRevisaoDeclaracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
