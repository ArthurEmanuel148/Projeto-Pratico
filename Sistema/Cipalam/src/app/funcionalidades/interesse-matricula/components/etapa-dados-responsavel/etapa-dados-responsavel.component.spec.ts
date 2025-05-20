import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EtapaDadosResponsavelComponent } from './etapa-dados-responsavel.component';

describe('EtapaDadosResponsavelComponent', () => {
  let component: EtapaDadosResponsavelComponent;
  let fixture: ComponentFixture<EtapaDadosResponsavelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EtapaDadosResponsavelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EtapaDadosResponsavelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
