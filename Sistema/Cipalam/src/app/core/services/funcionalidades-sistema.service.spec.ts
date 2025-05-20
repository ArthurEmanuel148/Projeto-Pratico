import { TestBed } from '@angular/core/testing';

import { FuncionalidadesSistemaService } from './funcionalidades-sistema.service';

describe('FuncionalidadesSistemaService', () => {
  let service: FuncionalidadesSistemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuncionalidadesSistemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
