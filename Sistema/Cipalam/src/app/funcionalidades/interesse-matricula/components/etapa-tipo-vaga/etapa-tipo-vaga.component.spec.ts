import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EtapaTipoVagaComponent } from './etapa-tipo-vaga.component';

describe('EtapaTipoVagaComponent', () => {
  let component: EtapaTipoVagaComponent;
  let fixture: ComponentFixture<EtapaTipoVagaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EtapaTipoVagaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EtapaTipoVagaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
