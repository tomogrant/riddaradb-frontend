import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotifsAll } from './motifs-all';

describe('MotifsAll', () => {
  let component: MotifsAll;
  let fixture: ComponentFixture<MotifsAll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotifsAll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
