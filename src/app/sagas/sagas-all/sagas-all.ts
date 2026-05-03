import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Modal } from 'bootstrap';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagaService } from '../common/saga.service';
import { ISagaVm } from '../common/ISagaVm';
import { SagaMapper } from '../common/saga-mapper';
import { ISagaVersionVm } from '../common/ISagaVersionVm';
import { SagaDate } from '../common/SagaDate';
import { Mode } from '../../shared/Enums';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sagas-all.html',
  styleUrl: './sagas-all.css',
  providers: [SagaService]
})

export class SagasAll implements OnInit {
  constructor(private sagasService: SagaService, 
              private sagaMapper: SagaMapper) {}

  pageTitle = 'Sagas';

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  showValidationErrors: boolean = false;

  sagas: ISagaVm[] = [];

  initialisedSaga: ISagaVm = {
    id: 0,
    title: '',
    description: '',
    translated: false,
    sagaVersions: []

  };
    initialisedSagaVersion: ISagaVersionVm = {
    id: 0,
    title: '',
    description: '',
    date: SagaDate.UNDEFINED,
    sagaId: 0,
    bibDto: [],
    folkloreIds: [],
    personIds: [],
    placeIds: [],
    objectIds: [],
    msIds: []
  };
  
  activeSaga: ISagaVm = this.initialisedSaga;

  editForm = new FormGroup(
    {title: new FormControl('', [Validators.required, titleUnique(this.sagas, this.activeSaga.title)]),
    translated: new FormControl(false)
    });

    get title() {
    return this.editForm.get('title') as FormControl;
    }

    get translated(){
      return this.editForm.get('translated') as FormControl;
    }

  ngOnInit() {
      this.displaySagas();
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  resetValidators(){
    this.title.clearValidators();
    this.title.addValidators([Validators.required, titleUnique(this.sagas, this.activeSaga.title)]);
    this.title.updateValueAndValidity();
  }

  fillInputFields(){
    this.title.setValue(this.activeSaga.title);
    this.translated.setValue(this.activeSaga.translated);
  }

  emptyInputFields(){
    this.title.setValue("");
    this.translated.setValue(false);
  }

  //---------------
  //  USER CHOICE
  //---------------

  editSaga(id: number){
    //Sets mode, resets field validation, selects saga for editing and populates fields
    this.mode = Mode.EDIT;
    this.selectSaga(id);
    this.showValidationErrors = false;
    this.fillInputFields();
  }

  addSaga(){
    //Sets mode,resets field validation, initialises selected saga and empties fields ready for user input
    this.mode = Mode.ADD;
    this.activeSaga = this.initialisedSaga;
    this.showValidationErrors = false;
    this.emptyInputFields();
  }

  selectSaga(id: number){
    let saga = this.sagas.find(i => i.id === id);
    if (typeof saga === 'undefined') {
      console.log("Saga not found");
      this.activeSaga = this.initialisedSaga;
    }
    else{
      console.log("saga with ID " + saga.id + " found.");
      this.activeSaga = saga;
    }
  }

  submitAddOrEdit(){
    this.resetValidators();
    if (this.title.valid){
      var editAddModal = document.getElementById('editAddSaga');
      if (editAddModal != null){
        var modal = Modal.getInstance(editAddModal);
        modal?.toggle();
      }
      if (this.mode === Mode.ADD){
        this.postSaga();
      }
      if (this.mode === Mode.EDIT){
        this.updateSaga();
      }
    }
    else{
      this.showValidationErrors = true;
    }
  }

  //---------------
  //     CRUD
  //---------------

  //CREATE
  postSaga(){
    this.activeSaga = this.initialisedSaga;
    this.activeSaga.title = this.title.value;
    this.activeSaga.translated = this.translated.value;
    this.sagasService.postSaga(this.sagaMapper.mapSagaVmToDto(this.activeSaga)).subscribe({
      next: receivedSaga => {
        var newSagaVersion = this.initialisedSagaVersion;
        newSagaVersion.title = this.title.value;
        newSagaVersion.sagaId = receivedSaga.id;
        this.sagasService.postSagaVersion(this.sagaMapper.mapSagaVersionVmToDto(newSagaVersion)).subscribe({
          next: receivedSagaVersion => {
            console.log("saga version posted successfully: " + receivedSagaVersion);
            this.displaySagas();
          },
          error: err => {
            console.log("Problem with saving saga version");
          }
        })
      },
      error: err => {
        console.log("Problem with saving saga");
      }
    })
  }

  //READ
  displaySagas() {
    this.sagasService.getSagas().subscribe({
      next: receivedSagas => {
        this.sagas = receivedSagas.sort((a, b) => a.title.localeCompare(b.title));
        //The custom validation method titleUnique does not get updated every time
        //the sagas list does, so this parameter needs manually passing. 
      },
      error: err => console.log('Error fetching sagas: ' + err)
    });
  }

  //UPDATE
  updateSaga(){
    this.activeSaga.title = this.title.value;
    this.activeSaga.translated = this.translated.value;
    this.sagasService.putSaga(this.sagaMapper.mapSagaVmToDto(this.activeSaga)).subscribe({
      next: receivedSaga => {
        console.log("Saved successfully! " + receivedSaga);
        this.displaySagas();
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

  //DELETE
  deleteSaga(){
    this.sagasService.deleteSaga(this.activeSaga.id).subscribe({
      next: saga => this.displaySagas(),
      error: err=> console.log("problem with deleting")
      })
    }
}

  //---------------
  //CUSTOM VALIDATION
  //---------------

  export function titleUnique(sagas: ISagaVm[], sagaName: string): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {


        const value = control.value;

        if (!value) {
            return null;
        }

        console.log("sagaName is: " + sagaName);
        console.log("Value is: " + value);

      let saga = sagas.find(saga => saga.title.toLowerCase() === value.toLowerCase());
      if (typeof saga === 'undefined') {
        console.log("Name is unique");
        return null;
      }
      //Saga exists with this name. If not the current saga's name, return error
      else if (value !== sagaName){
        return { nameNotUnique: true };
      }
      else{
        return null;
      }
    }
}