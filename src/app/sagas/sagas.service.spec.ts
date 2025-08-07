import { TestBed } from '@angular/core/testing';

import { SagasService } from './sagas.service';

describe('SagasService', () => {
  let service: SagasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SagasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
