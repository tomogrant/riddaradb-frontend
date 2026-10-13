import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SagasAll } from "./sagas-all";
import { SagaService } from "../common/saga.service";
import { ISagaResponseDto } from "../common/ISagaResponseDto";
import { of } from "rxjs";
import { ISagaTitleDto } from "../common/ISagaTitleDto";

describe("SagasAll", () => {
  let component: SagasAll;
  let fixture: ComponentFixture<SagasAll>;

  let sagaTitle: ISagaTitleDto = {
    id: 0,
    title: "Mock title"
  }

  let sagaTitles: ISagaTitleDto[] = [sagaTitle];

  beforeEach(async () => {
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(["getSagaTitles"]);
    sagaServiceSpy.getSagaTitles.and.callFake(function () {
      return of(sagaTitles);
    });

    await TestBed.configureTestingModule({
      imports: [SagasAll],
      providers: [
        {
          provide: SagaService,
          useValue: sagaServiceSpy,
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SagasAll);
    component = fixture.componentInstance;
    //The first time this is run it will execute the constructor and run ngOnInit().
    fixture.detectChanges();
  });

  it("Component should be defined", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit should return sagas", () => {
    expect(component.sagas.length).toBeGreaterThanOrEqual(1);
    expect(component.sagas[0].title).toEqual(sagaTitle.title);
  });
});
