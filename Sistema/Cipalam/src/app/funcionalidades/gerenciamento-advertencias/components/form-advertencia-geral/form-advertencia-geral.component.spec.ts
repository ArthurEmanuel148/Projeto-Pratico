import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormAdvertenciaGeralComponent } from './form-advertencia-geral.component';

describe('FormAdvertenciaGeralComponent', () => {
  let component: FormAdvertenciaGeralComponent;
  let fixture: ComponentFixture<FormAdvertenciaGeralComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAdvertenciaGeralComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormAdvertenciaGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
