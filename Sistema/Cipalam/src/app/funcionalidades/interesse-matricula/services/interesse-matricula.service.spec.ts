import { TestBed } from '@angular/core/testing';

import { InteresseMatriculaService } from './interesse-matricula.service';

describe('InteresseMatriculaService', () => {
  let service: InteresseMatriculaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteresseMatriculaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
