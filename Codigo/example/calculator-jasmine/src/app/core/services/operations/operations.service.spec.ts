import { TestBed } from '@angular/core/testing';

import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  let service: OperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('sum', () => {
  //   const a = 8;
  //   const b = 4;

  //   expect(service.sum(a, b)).toBe(12);
  // });

  // it('subtract', () => {
  //   const a = 8;
  //   const b = 4;

  //   expect(service.subtract(a, b)).toBe(4);
  // });

  it('multiplicate', () => {
    const a = 8;
    const b = 4;

    expect(service.multiplicate(a, b)).toBe(32);
  });

  it('divise', () => {
    const a = 8;
    const b = 4;

    expect(service.divise(a, b)).toBe(2);
  });
});
