import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, ParamMap } from "@angular/router";
import { SagaSingle } from "./saga-single";
import { ISagaResponseDto } from "../common/ISagaResponseDto";
import { ISagaTitleDto } from "../common/ISagaTitleDto";
import { of } from "rxjs";
import { SagaService } from "../common/saga.service";
import { signal } from "@angular/core";
import { AuthService } from "../../auth/auth.service";

describe("SagaSingle", () => {
  let activatedRouteMock: any;

  let authServiceMock = {
    $loggedIn: signal(true),
    $isAdmin: signal(true),
  };

  let sagaResponseDto: ISagaResponseDto = {
    id: 1,
    title: "Title",
    translatedTitle: "Translated title",
    pageAuthor: "Author",
    description: "Description",
    translated: false,
    bibDtos: [],
    sagaVersions: [],
    sagaMsDtos: [],
  };

  let updatedSagaResponseDto: ISagaResponseDto = {
    id: 1,
    title: "New title",
    translatedTitle: "Translated title",
    pageAuthor: "Author",
    description: "New description",
    translated: true,
    bibDtos: [],
    sagaVersions: [],
    sagaMsDtos: [],
  };

  let sagaTitleDto: ISagaTitleDto = {
    id: 1,
    title: "Example saga title",
  };

  let sagaTitleDtos: ISagaTitleDto[] = [sagaTitleDto];

  //Executed before each it() test
  beforeEach(async () => {
    //Sets up the activated route to be provided to the TestBed
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    //Initialisation
    authServiceMock.$isAdmin.set(true);
    authServiceMock.$loggedIn.set(true);

    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: "1" });

    //Sets up the mock SagaService instance to be passed to the TestBed
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>([
      "getSagaById",
      "getSagaTitles",
      "putSaga",
      "postSaga",
      "deleteSaga",
    ]);

    sagaServiceSpy.getSagaById.and.returnValue(of(sagaResponseDto));
    sagaServiceSpy.getSagaTitles.and.returnValue(of(sagaTitleDtos));
    sagaServiceSpy.postSaga.and.returnValue(of(sagaResponseDto));
    sagaServiceSpy.putSaga.and.returnValue(of(sagaResponseDto));
    sagaServiceSpy.deleteSaga.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [SagaSingle],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: SagaService,
          useValue: sagaServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    }).compileComponents();
  });

  //Tests
  it("Component should be created", () => {
    //Creates testing harness
    const fixture = TestBed.createComponent(SagaSingle);
    //Instance of the component class
    const component = fixture.componentInstance;
    //Triggers change detection cycle, including running ngOnInit if not run before
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it("ngOnInit should return sagas when not in add mode", () => {
    const fixture = TestBed.createComponent(SagaSingle);
    const component = fixture.componentInstance;
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
    fixture.detectChanges();

    expect(sagaService.getSagaById).toHaveBeenCalledWith(1);
    expect(component.sagaEntry).toEqual(
      jasmine.objectContaining({
        id: 1,
      }),
    );
  });

  ["1.5", "", "1 ", "0", "abc", undefined].forEach((invalidParam) => {
    it(`Invalid parameter ${invalidParam} should not fetch saga`, () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: invalidParam });
      const fixture = TestBed.createComponent(SagaSingle);
      const component = fixture.componentInstance;

      const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
      spyOn(component, "navigateToSagasAllPage");

      fixture.detectChanges();

      expect(component.navigateToSagasAllPage).toHaveBeenCalled();
      expect(sagaService.getSagaById).not.toHaveBeenCalled();
    });
  });

  it("Buttons are unavailable to unauthenticated users", () => {
    authServiceMock.$isAdmin.set(false);
    authServiceMock.$loggedIn.set(false);

    const fixture = TestBed.createComponent(SagaSingle);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).toBeNull();
    expect(deleteButton).toBeNull();
  });

  it("Delete button not available to regular users", () => {
    authServiceMock.$isAdmin.set(false);

    const fixture = TestBed.createComponent(SagaSingle);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).not.toBeNull();
    expect(deleteButton).toBeNull();
  });

  it("All buttons available to admin", () => {
    const fixture = TestBed.createComponent(SagaSingle);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).not.toBeNull();
    expect(deleteButton).not.toBeNull();
  });

  it("Add modal posts saga", () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ mode: "add" });
    const fixture = TestBed.createComponent(SagaSingle);
    const component = fixture.componentInstance;
    //We don't want the add modal to actually open
    spyOn(component, "openAddEditModal");
    spyOn(component, "closeAddEditModal");

    fixture.detectChanges();

    const addSagaVersionButton = fixture.nativeElement.querySelector('[data-testid="add-saga-version-button"]');
    addSagaVersionButton.click();
    fixture.detectChanges();

    component.title.setValue("Saga title");
    component.translatedTitle.setValue("Translated saga title");
    component.pageAuthor.setValue("Author");
    component.description.setValue("Description");
    component.translated.setValue(false);

    component.sagaVersionForms.controls[0].get("title")?.setValue("Saga version title 1");
    component.sagaVersionForms.controls[1].get("title")?.setValue("Saga version title 2");

    component.sagaVersionForms.controls[0].get("date")?.setValue("1250-1300");
    component.sagaVersionForms.controls[1].get("date")?.setValue("1250-1300");

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
    saveButton.click();
    fixture.detectChanges();

    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(sagaService.postSaga).toHaveBeenCalledTimes(1);
    expect(sagaService.postSaga).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: null,
        title: "Saga title",
        description: "Description",
      }),
    );
  });

  it("Edit modal populates and updates saga", () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: "1" });
    const fixture = TestBed.createComponent(SagaSingle);
    const component = fixture.componentInstance;
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
    spyOn(component, "openAddEditModal");
    spyOn(component, "closeAddEditModal");
    //Runs ngOnInit
    fixture.detectChanges();

    //Gets button by data-testid, clicks button, and triggers change detection which runs
    //this.type.valueChanges.pipe().
    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    editButton.click();
    fixture.detectChanges();

    component.title.setValue("Updated title");

    //Clicks the save button
    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    saveButton.click();
    fixture.detectChanges();

    //Expects edit form to be valid, bib service to have updated entry and to have
    //returned the updated bib object
    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(sagaService.putSaga).toHaveBeenCalledTimes(1);
    expect(sagaService.putSaga).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 1,
        title: "Updated title",
      }),
    );
  });

  it("Delete modal deletes saga", () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: "1" });
    const fixture = TestBed.createComponent(SagaSingle);
    const component = fixture.componentInstance;
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
    spyOn(component, "openDeleteModal");
    spyOn(component, "closeDeleteModal");

    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');
    const deleteConfirmButton = fixture.nativeElement.querySelector('[data-testid="delete-confirm-button"]');

    deleteButton.click();
    fixture.detectChanges();

    deleteConfirmButton.click();
    fixture.detectChanges();

    expect(component.openDeleteModal).toHaveBeenCalled();
    expect(component.closeDeleteModal).toHaveBeenCalled();
    expect(sagaService.deleteSaga).toHaveBeenCalledTimes(1);
    expect(sagaService.deleteSaga).toHaveBeenCalledWith(1);
  });
});
