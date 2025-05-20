import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ComprovanteDeclaracaoComponent } from './comprovante-declaracao.component';

describe('ComprovanteDeclaracaoComponent', () => {
  let component: ComprovanteDeclaracaoComponent;
  let fixture: ComponentFixture<ComprovanteDeclaracaoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprovanteDeclaracaoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ComprovanteDeclaracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
