import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EtapaHorariosVagaComponent } from './etapa-horarios-vaga.component';

describe('EtapaHorariosVagaComponent', () => {
  let component: EtapaHorariosVagaComponent;
  let fixture: ComponentFixture<EtapaHorariosVagaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EtapaHorariosVagaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EtapaHorariosVagaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
