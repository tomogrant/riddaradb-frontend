import { FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators} from '@angular/forms';
import { Component } from '@angular/core';
import { Modal } from 'bootstrap';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MsService } from '../common/ms.service';
import { CommonModule } from '@angular/common';
import { IMs } from '../common/IMs';
import { IMsRepositoryVm } from '../common/IMsRepositoryVm';
import { Mode } from '../../shared/Enums';
import { IMsRepositoryDto } from '../common/IMsRepositoryDto';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterTestingHarness } from '@angular/router/testing';
import { SagaService } from '../../sagas/common/saga.service';
import { ISagaTitleDto } from '../../sagas/common/ISagaTitleDto';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-ms-single',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, QuillModule],
  templateUrl: './ms-single.html',
  styleUrl: './ms-single.css'
})

export class MsSingle{

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private msService: MsService,
      private sagaService: SagaService,

  ){}

  //Forms
  editForm = new FormGroup({
      id: new FormControl<number | null>({value: null, disabled: true}),
      name: new FormControl<string>(''),
      shelfmark: new FormControl<string>(''),
      description: new FormControl<string>(''),
      msSagas: new FormArray<FormGroup>([])
  });

  get name() {
    return this.editForm.get('name') as FormControl;
  }

  get shelfmark() {
    return this.editForm.get('shelfmark') as FormControl;
  }

  get description() {
    return this.editForm.get('description') as FormControl;
  }

    get msSagas() {
    return this.editForm.get('msSagas') as FormArray<FormGroup>;
  }

  showValidationErrors: boolean  = false;

  sagas: ISagaTitleDto[] = [];
  attachedSagas: ISagaTitleDto[] = [];
  activeMs: IMs = this.initialiseMs();
  repo: IMsRepositoryDto = this.initialiseRepository();

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  ngOnInit() {

    this.setup();
  }

  setup(){
    
    const mode = this.route.snapshot.paramMap.get('mode');
    const id = Number(this.route.snapshot.paramMap.get('id'));

    //ADD MODE
    if (mode == 'add'){
      this.getSagas();
      this.getRepo();
      this.addMs();
    }
    else if (!Number.isNaN(id)){
      this.msService.getMsEntryById(id).subscribe(receivedEntry => {
        if (receivedEntry == null){
          console.log("Ms entry not found");
          this.navigateToMsAllPage();
        }
        this.activeMs = receivedEntry;
        this.getSagas();
        this.getRepo();
      });
    }

    else{
      console.log("parameter is incorrect");
      this.navigateToMsAllPage();
    }

    this.sagas.forEach(saga => {

      this.msSagas.push(this.createSagaMsFormGroup(saga.id));
    });
  }

  createSagaMsFormGroup(id: number, folioNr: string = ''): FormGroup{
    return new FormGroup({
        id: new FormControl(id),
        folio: new FormGroup<string>(folioNr)
      });
  }

  editMs(){
      this.mode = Mode.EDIT;

      this.name.setValue(this.activeMs.name);
      this.shelfmark.setValue(this.activeMs.shelfmark);
      this.description.setValue(this.activeMs.description);

      this.openAddEditModal();

  }

  addMs(){
    
  }

  submitAddOrEdit(){
      this.name.clearValidators();
      this.name.addValidators(Validators.required);
      this.name.updateValueAndValidity();

    if (this.editForm.valid){
      this.closeAddEditModal();

      this.activeMs.name = this.name.value;

      if (this.mode === Mode.ADD){
        this.postMs();
      }
      else if (this.mode === Mode.EDIT){
        this.updateMs();
      }

    }
    else{
      this.showValidationErrors = true;
    }
  }

  getSagas(){
    this.sagaService.getSagaTitles().subscribe(sagas => 
    {
      this.sagas = [];
      sagas.forEach(saga => this.sagas.push(saga));
      this.sagas.sort((a, b) => a.title.localeCompare(b.title));

      // this.attachedSagas = this.sagas.filter(saga => 
      //   this.activeBib.sagaIds.includes(saga.id));
    });
  }

  getRepo(){
    this.msService.getMsRepository(this.activeMs.msRepositoryId).subscribe(repo => {
      this.repo = repo;
    })
  }

  navigateToMsAllPage(){
    this.closeAddEditModal();
    this.router.navigate([`ms`]);
  }

  openAddEditModal(){
    var editAddModal = document.getElementById('addEditMs');
    if (editAddModal != null){
      var modal = Modal.getOrCreateInstance(editAddModal);
        modal?.show();
    }
  }

  closeAddEditModal(){
    var editAddModal = document.getElementById('addEditMs');
    if (editAddModal != null){
      var modal = Modal.getInstance(editAddModal);
      modal?.hide();
    }
  }

  openDeleteModal(){
    var deleteModal = document.getElementById('deleteMs');
    if (deleteModal != null){
      var modal = Modal.getOrCreateInstance(deleteModal);
        modal?.show();
    }
  }

  closeDeleteModal(){
    var deleteModal = document.getElementById('deleteMs');
    if (deleteModal != null){
      var modal = Modal.getInstance(deleteModal);
      modal?.hide();
    }
  }

  postMs(){

  }

  updateMs(){

  }

  deleteMs(){

  }

  initialiseMs(): IMs {
    return {
      id: null,
      name: '',
      shelfmark: '',
      description: '',
      msSaga: [],
      msRepositoryId: 0
    }
  }

  initialiseRepository(){
    return {
      id: null,
      name: '',
      msIds: []
    }
  }

}