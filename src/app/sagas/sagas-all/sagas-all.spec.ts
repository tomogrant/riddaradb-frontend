import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SagasAll } from './sagas-all';
import { SagaService } from '../common/saga.service';
import { ISagaResponseDto } from '../common/ISagaResponseDto';
import { of } from 'rxjs';

describe('SagasAll', () => {
  let component: SagasAll;
  let fixture: ComponentFixture<SagasAll>;

let sagaResponseDto: ISagaResponseDto = {
    id: 1,
    title: "Title",
    description: "Description",
    translated: false,
    bibDto: [],
    sagaVersions: []
};

let sagaResponseDtos : ISagaResponseDto[] = [sagaResponseDto];

  beforeEach(async () => {
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(['getSagas']);
    sagaServiceSpy.getSagas.and.callFake(function (){
      return of(sagaResponseDtos);
    });

    await TestBed.configureTestingModule({
      imports: [SagasAll],
      providers: [
        {
          provide: SagaService,
          useValue: sagaServiceSpy
        },
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SagasAll);
    component = fixture.componentInstance;
    //The first time this is run it will execute the constructor and run ngOnInit().
    fixture.detectChanges();
  });

  it('Component should be defined', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should return sagas', () => {
    expect(component.sagas.length).toBeGreaterThanOrEqual(1);
    expect(component.sagas[0].title).toEqual(sagaResponseDto.title);
  });
});
