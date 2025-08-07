import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SagasComponent } from './sagas';

describe('Sagas', () => {
  let component: SagasComponent;
  let fixture: ComponentFixture<SagasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SagasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SagasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
