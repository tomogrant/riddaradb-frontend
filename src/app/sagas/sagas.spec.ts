import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sagas } from './sagas';

describe('Sagas', () => {
  let component: Sagas;
  let fixture: ComponentFixture<Sagas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sagas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sagas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
