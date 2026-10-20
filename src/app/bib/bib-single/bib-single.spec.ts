import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { BibSingle } from "./bib-single";
import { BibService } from "../common/bib.service";
import { IBib, PublicationType } from "../common/IBib";
import { of } from "rxjs";
import { SagaService } from "../../sagas/common/saga.service";
import { ISagaTitleDto } from "../../sagas/common/ISagaTitleDto";
import { AuthService } from "../../auth/auth.service";
import { signal } from "@angular/core";

describe("BibSingle", () => {
  let activatedRouteMock: any;

  let authServiceMock = {
    $loggedIn: signal(true),
  };

  let bib: IBib = {
    id: 1,
    publicationType: PublicationType.OTHER,
    authors: "T. Grant",
    editors: "J. Hui",
    translators: "B. Allport",
    title: "Title",
    url: "www.url.com",
    bookEditors: "E. Editor",
    book: "Book name",
    bookSeries: "Book series",
    volume: "1",
    numOfVolumes: "1",
    placeOfPublication: "Cambridge",
    publisher: "Cambridge University Press",
    publicationYear: "2026",
    pageNumbers: "10-15",
    sagaIds: [],
    recommended: false,
    description: "Description",
  };

  let updatedBib: IBib = {
    id: 1,
    publicationType: PublicationType.OTHER,
    authors: "T. Grant",
    editors: "J. Hui",
    translators: "B. Allport",
    title: "Updated title",
    url: "www.url.com",
    bookEditors: "E. Editor",
    book: "Book name",
    bookSeries: "Book series",
    volume: "1",
    numOfVolumes: "1",
    placeOfPublication: "Cambridge",
    publisher: "Cambridge University Press",
    publicationYear: "2026",
    pageNumbers: "10-15",
    sagaIds: [],
    recommended: false,
    description: "Description",
  };

  let saga: ISagaTitleDto = {
    id: 1,
    title: "Example saga title",
  };

  let sagas: ISagaTitleDto[] = [saga];

  //Executed before each it() test
  beforeEach(async () => {
    //Sets up the activated route to be provided to the TestBed
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    //Initialisations
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: "1" });
    authServiceMock.$loggedIn.set(true);

    //Sets up the mock BibService instance to be passed to the TestBed
    const bibServiceSpy = jasmine.createSpyObj<BibService>(["getBibEntryById", "putBib", "postBib", "deleteBib"]);
    //When the bib service's getBibEntryById function is called, return the bib entry defined above
    bibServiceSpy.getBibEntryById.and.returnValue(of(bib));
    bibServiceSpy.postBib.and.returnValue(of(bib));
    bibServiceSpy.putBib.and.returnValue(of(bib));
    bibServiceSpy.deleteBib.and.returnValue(of(null));

    //Sets up the mock SagaService instance to be passed to the TestBed
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(["getSagaTitles"]);
    //When the saga service's getSagaTitles function is called, return the list of sagas defined above
    sagaServiceSpy.getSagaTitles.and.callFake(function () {
      return of(sagas);
    });

    await TestBed.configureTestingModule({
      imports: [BibSingle],
      //When BibSingle accesses these classes, spies are provided instead
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: BibService,
          useValue: bibServiceSpy,
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

  it("ngOnInit should return bibliography entries when not in add mode", () => {
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.activeBib).toEqual(bib);
    expect(component.activeBibVm).toEqual(
      jasmine.objectContaining({
        id: bib.id,
      }),
    );
    expect(component.sagas).toBeTruthy();
  });

  ["1.5", "", "1 ", "0", "abc", undefined].forEach((invalidParam) => {
    it(`Invalid parameter ${invalidParam} should not fetch saga`, () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: invalidParam });
      const fixture = TestBed.createComponent(BibSingle);
      const component = fixture.componentInstance;

      const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
      spyOn(component, "navigateToBibAllPage");

      fixture.detectChanges();

      expect(component.navigateToBibAllPage).toHaveBeenCalled();
      expect(bibService.getBibEntryById).not.toHaveBeenCalled();
    });
  });

  it("Buttons are unavailable to unauthenticated users", () => {
    authServiceMock.$loggedIn.set(false);

    const fixture = TestBed.createComponent(BibSingle);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).toBeNull();
    expect(deleteButton).toBeNull();
  });

  it("Buttons are available to all authenticated users", () => {
    const fixture = TestBed.createComponent(BibSingle);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).not.toBeNull();
    expect(deleteButton).not.toBeNull();
  });

  it("Add modal posts bib entry", () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ mode: "add" });
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
    //We don't want the add modal to actually open
    spyOn(component, "openAddEditModal");
    spyOn(component, "closeAddEditModal");

    fixture.detectChanges();

    component.type.setValue(PublicationType.OTHER);
    fixture.detectChanges();

    component.authors.setValue("Author");
    component.title.setValue("Title");

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    saveButton.click();
    fixture.detectChanges();

    expect(component.sagas).toBeTruthy();
    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalledTimes(1);
    expect(component.closeAddEditModal).toHaveBeenCalledTimes(1);
    expect(bibService.postBib).toHaveBeenCalledTimes(1);
    expect(bibService.postBib).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: null,
        title: "Title",
        authors: "Author",
      }),
    );
  });

  it("Edit modal populates and updates bib entry", () => {
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
    spyOn(component, "openAddEditModal");
    spyOn(component, "closeAddEditModal");
    //Runs ngOnInit
    fixture.detectChanges();

    //Gets button by data-testid, clicks button, and triggers change detection which runs
    //this.type.valueChanges.pipe().
    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    editButton.click();
    fixture.detectChanges();

    component.title.setValue("New title");

    //Clicks the save button
    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    saveButton.click();
    fixture.detectChanges();

    //Expects edit form to be valid, bib service to have updated entry and to have
    //returned the updated bib object
    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(bibService.putBib).toHaveBeenCalledTimes(1);
    expect(bibService.putBib).toHaveBeenCalledWith(
      jasmine.objectContaining({
        publicationType: PublicationType.OTHER,
        id: 1,
        title: "New title",
      }),
    );
  });

  it("Delete modal deletes bib entry", () => {
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
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
    expect(bibService.deleteBib).toHaveBeenCalledTimes(1);
    expect(bibService.deleteBib).toHaveBeenCalledWith(1);
  });
});
