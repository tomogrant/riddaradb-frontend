import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { SagasSingle } from './sagas-single';
import { ISagaResponseDto } from '../common/ISagaResponseDto';
import { ISagaTitleDto } from '../../sagas/common/ISagaTitleDto';
import { of } from 'rxjs';
import { SagaService } from '../../sagas/common/saga.service';

describe('SagasSingle', () => {
  let activatedRouteMock: any;

  let sagaResponseDto: ISagaResponseDto = {
    id: 1,
    title: "Title",
    description: "Description",
    translated: false,
    bibDto: [],
    sagaVersions: []
};

let sagaResponseDtos : ISagaResponseDto[] = [sagaResponseDto];

  let updatedSagaResponseDto: ISagaResponseDto = {
    id: 1,
    title: "New title",
    description: "New description",
    translated: true,
    bibDto: [],
    sagaVersions: []
};

  let sagaTitleDto: ISagaTitleDto = {
    id: 1,
    title: 'Example saga title'
  }

  //Executed before each it() test
  beforeEach(async () => {
    //Sets up the activated route to be provided to the TestBed
    activatedRouteMock = {
        snapshot: {
            paramMap: convertToParamMap({})
        }
    }

    //Sets up the mock SagaService instance to be passed to the TestBed
    const sagaServiceSpy = jasmine.createSpyObj<SagaService>(['getSagaById', 'putSaga', 'postSaga', 'deleteSaga']);

    sagaServiceSpy.getSagaById.and.callFake(function (){
        return of(sagaResponseDto);
    });

    sagaServiceSpy.postSaga.and.callFake(function(){
        return of(sagaResponseDto);
    });

    sagaServiceSpy.putSaga.and.callFake(function(){
        return of(updatedSagaResponseDto);
    });

    sagaServiceSpy.deleteSaga.and.callFake(function(){
        return of(sagaResponseDto);
    });

    await TestBed.configureTestingModule({
      imports: [SagasSingle],
      //When BibSingle accesses these classes, spies are provided instead
      providers: [
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
    const fixture = TestBed.createComponent(SagasSingle);
    //Instance of the component class
    const component = fixture.componentInstance;
    //Triggers change detection cycle, including running ngOnInit if not run before
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('ngOnInit should return sagas when not in add mode', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(SagasSingle);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.sagaEntry).toBeTruthy();
    expect(component.sagaVersions).toBeTruthy();
  });

  it('Add modal posts saga', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ mode: 'add' });
    const fixture = TestBed.createComponent(SagasSingle);
    const component = fixture.componentInstance;
    //We don't want the add modal to actually open
    spyOn(component, 'openAddEditModal');
    spyOn(component, 'closeAddEditModal');

    fixture.detectChanges();

    const addSagaVersionButton  = fixture.nativeElement.querySelector('[data-testid="add-saga-version-button"]');
    addSagaVersionButton.click();
    fixture.detectChanges();

    component.title.setValue('Saga title');
    component.description.setValue('Description');
    component.translated.setValue(false);

    component.sagaVersionForms.controls[0].get('title')?.setValue('Saga version title 1');
    component.sagaVersionForms.controls[1].get('title')?.setValue('Saga version title 2');

    component.sagaVersionForms.controls[0].get('date')?.setValue('1250-1300');
    component.sagaVersionForms.controls[1].get('date')?.setValue('1250-1300');


    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
    saveButton.click();
    fixture.detectChanges();

    expect(component.editForm.valid).toBeTrue();
    expect(component.openAddEditModal).toHaveBeenCalled();
    expect(component.closeAddEditModal).toHaveBeenCalled();
    expect(sagaService.postSaga).toHaveBeenCalled();
  });

  it('Edit modal populates and updates saga', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(SagasSingle);
    const component = fixture.componentInstance;
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
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
    expect(sagaService.putSaga).toHaveBeenCalled();
  });

  it('Delete modal deletes saga', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
    const fixture = TestBed.createComponent(SagasSingle);
    const component = fixture.componentInstance;
    const sagaService = TestBed.inject(SagaService) as jasmine.SpyObj<SagaService>;
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
    expect(sagaService.deleteSaga).toHaveBeenCalled();
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

