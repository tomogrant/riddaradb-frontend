import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BibSingle } from './bib-single';
import { BibService } from '../common/bib.service';
import { IBib, PublicationType } from '../common/IBib';
import { of } from 'rxjs';
import { SagaService } from '../../sagas/common/saga.service';
import { ISagaTitleDto } from '../../sagas/common/ISagaTitleDto';

describe('BibSingle', () => {
  let activatedRouteMock: any;

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
    description: "Description"
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
    description: "Description"
  };

  let saga: ISagaTitleDto = {
    id: 1,
    title: 'Example saga title'
  }

  let sagas: ISagaTitleDto[] = [saga];

  //Executed before each it() test
  beforeEach(async () => {
    //Sets up the activated route to be provided to the TestBed
    activatedRouteMock = {
        snapshot: {
            paramMap: convertToParamMap({})
        }
    }

    //Sets up the mock BibService instance to be passed to the TestBed
    const bibServiceSpy = jasmine.createSpyObj<BibService>(['getBibEntryById', 'putBib', 'postBib', 'deleteBib']);
    //When the bib service's getBibEntryById function is called, return the bib entry defined above
    bibServiceSpy.getBibEntryById.and.callFake(function (){
        return of(bib);
    });
    //Ditto
    bibServiceSpy.postBib.and.callFake(function(){
        return of(bib);
    });

    bibServiceSpy.putBib.and.callFake(function(){
        return of(updatedBib);
    });

    bibServiceSpy.deleteBib.and.callFake(function(){
        return of(bib);
    });

    //Sets up the mock SagaService instance to be passed to the TestBed
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(['getSagaTitles']);
    //When the saga service's getSagaTitles function is called, return the list of sagas defined above
    sagaServiceSpy.getSagaTitles.and.callFake(function(){
        return of(sagas);
    });

    await TestBed.configureTestingModule({
      imports: [BibSingle],
      //When BibSingle accesses these classes, spies are provided instead
      providers: [
        {
            provide: BibService,
            useValue: bibServiceSpy
        },
        {
            provide: SagaService,
            useValue: sagaServiceSpy
        },
        {
            provide: ActivatedRoute,
            useValue: activatedRouteMock
        }
      ]
    })
    .compileComponents();
  });

  //Tests
  it('Component should be created', () => {
    //Creates testing harness
    const fixture = TestBed.createComponent(BibSingle);
    //Instance of the component class
    const component = fixture.componentInstance;
    //Triggers change detection cycle, including running ngOnInit if not run before
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('Header should read "Bibliography"', () => {
    const fixture = TestBed.createComponent(BibSingle);

    const header = fixture.nativeElement.querySelector('h1');
    if (header)
      expect(header.textContent).toContain('Bibliography');
  });

  it('ngOnInit should return bibliography entries when not in add mode', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.activeBib).toBeTruthy();
    expect(component.activeBibVm).toBeTruthy();
    expect(component.sagas).toBeTruthy();
  });

  it('Add modal posts bib entry', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ mode: 'add' });
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    //We don't want the add modal to actually open
    spyOn(component, 'openAddEditModal');
    spyOn(component, 'closeAddEditModal');

    fixture.detectChanges();

    component.type.setValue(PublicationType.OTHER);
    fixture.detectChanges();

    component.authors.setValue('Author');
    component.title.setValue('Title');

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
    saveButton.click();
    fixture.detectChanges();

    expect(component.sagas).toBeTruthy();
    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(bibService.postBib).toHaveBeenCalled();
  });

  it('Edit modal populates and updates bib entry', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
    spyOn(component, 'openAddEditModal');
    spyOn(component, 'closeAddEditModal');
    //Runs ngOnInit
    fixture.detectChanges();

    //Gets button by data-testid, clicks button, and triggers change detection which runs
    //this.type.valueChanges.pipe().
    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    editButton.click();
    fixture.detectChanges();

    //Clicks the save button 
    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    saveButton.click();
    fixture.detectChanges();
    
    //Expects edit form to be valid, bib service to have updated entry and to have
    //returned the updated bib object
    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(bibService.putBib).toHaveBeenCalled();
    expect(component.activeBib.title).toBe('Updated title');
  });

  it('Delete modal deletes bib entry', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(BibSingle);
    const component = fixture.componentInstance;
    const bibService = TestBed.inject(BibService) as jasmine.SpyObj<BibService>;
    spyOn(component, 'openDeleteModal');
    spyOn(component, 'closeDeleteModal');

    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');
    const deleteConfirmButton = fixture.nativeElement.querySelector('[data-testid="delete-confirm-button"]');

    deleteButton.click();
    fixture.detectChanges();

    deleteConfirmButton.click();
    fixture.detectChanges();

    expect(component.openDeleteModal).toHaveBeenCalled();
    expect(component.closeDeleteModal).toHaveBeenCalled();
    expect(bibService.deleteBib).toHaveBeenCalled();
  });

//   afterEach(() => {
//     //Modals display strange behaviour in karma. This manually destroys them
//     //after each test. 
//     document.querySelectorAll('.modal').forEach(element => {
//         const modal = Modal.getInstance(element);
//         modal?.dispose();
//         });
//     });
});

