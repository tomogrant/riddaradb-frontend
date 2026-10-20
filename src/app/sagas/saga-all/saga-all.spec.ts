import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SagaAll } from "./saga-all";
import { SagaService } from "../common/saga.service";
import { ISagaResponseDto } from "../common/ISagaResponseDto";
import { of } from "rxjs";
import { ISagaTitleDto } from "../common/ISagaTitleDto";
import { signal } from "@angular/core";
import { AuthService } from "../../auth/auth.service";

describe("SagasAll", () => {
  let component: SagaAll;
  let fixture: ComponentFixture<SagaAll>;

  let authServiceMock = {
    $loggedIn: signal(true),
  };

  let sagaTitle: ISagaTitleDto = {
    id: 0,
    title: "Mock title",
  };

  let sagaTitles: ISagaTitleDto[] = [sagaTitle];

  beforeEach(async () => {
    authServiceMock.$loggedIn.set(true);

    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(["getSagaTitles"]);
    sagaServiceSpy.getSagaTitles.and.callFake(function () {
      return of(sagaTitles);
    });

    await TestBed.configureTestingModule({
      imports: [SagaAll],
      providers: [
        {
          provide: SagaService,
          useValue: sagaServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SagaAll);
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

  it("Add button hidden to unauthenticated users", () => {
    authServiceMock.$loggedIn.set(false);
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    expect(addButton).toBeNull();
  });

  it("Add button exposed to authenticated users", () => {
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    expect(addButton).not.toBeNull();
  });
});
