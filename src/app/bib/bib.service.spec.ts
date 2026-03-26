import { TestBed } from '@angular/core/testing';

import { BibService } from './bib.service';

describe('BibService', () => {
  let service: BibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
