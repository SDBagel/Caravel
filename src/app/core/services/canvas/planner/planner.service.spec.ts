import { TestBed } from '@angular/core/testing';

import { PlannerService } from './planner.service';

describe('PlannerService', () => {
  let service: PlannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
