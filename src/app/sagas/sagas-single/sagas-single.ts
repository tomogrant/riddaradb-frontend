import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Modal } from 'bootstrap';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill'
import { IBib } from '../../bib/IBib';
import { ISagaVm } from '../common/ISagaVm';
import { SagaService } from '../common/saga.service';
import {ISagaVersionVm } from '../common/ISagaVersionVm'
import { SagaMapper } from '../common/saga-mapper';
import { SagaDate } from '../common/SagaDate';
import { Mode } from '../../shared/Enums';

@Component({
  selector: 'app-saga-entry',
  imports: [CommonModule, RouterModule, ReactiveFormsModule,
            QuillModule],
  templateUrl: './sagas-single.html',
  styleUrl: './sagas-single.css',
  encapsulation: ViewEncapsulation.None
})
export class SagasSingle implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private sagasService: SagaService,
    private sagaMapper: SagaMapper
  ) {}

    readonly SagaDate = SagaDate;
    readonly Mode = Mode;
    mode: Mode = Mode.NONE;

    sagaEntry: ISagaVm = {
    id: 0,
    title: '',
    description: '',
    translated: false,
    sagaVersions: []
  };

  sagaVersions: ISagaVersionVm[] = [];

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

  activeSagaVersion: ISagaVersionVm = this.initialisedSagaVersion;

  showValidationErrors: boolean = false;

  editForm = new FormGroup({
    title: new FormControl('', [Validators.required, titleUnique(this.sagaEntry.sagaVersions, this.activeSagaVersion.title)]),
    description: new FormControl(''),
    date: new FormControl('Select a date:', dateNotSelected()),
    isTranslated: new FormControl(false)
  });

  get title() {
  return this.editForm.get('title') as FormControl;
  }
  get description() {
  return this.editForm.get('description') as FormControl;
  }

  get date(){
    return this.editForm.get('date') as FormControl;
  }

  ngOnInit() {
    this.displaySaga();
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  mapToUi(sagaDate: SagaDate){
    switch(sagaDate){
      case(SagaDate._1250_1300):{
        return "1250-1300";
      }
      case(SagaDate._1300_1350):{
        return "1300-1350";
      }
      case(SagaDate._1350_1400):{
        return "1350-1400";
      }
      case(SagaDate._1400_1450):{
        return "1400-1450";
      }
      case(SagaDate._1450_1500):{
        return "1450-1500";
      }
      case(SagaDate._1500_1550):{
        return "1500-1550";
      }
      default:{
        return "Select a date:";
      }
    }
  }

  mapFromUi(sagaDate: string){
    switch(sagaDate){
      case("1250-1300"):{
        return SagaDate._1250_1300;
      }
      case("1300-1350"):{
        return SagaDate._1300_1350;
      }
      case("1350-1400"):{
        return SagaDate._1350_1400;
      }
      case("1400-1450"):{
        return SagaDate._1400_1450;
      }
      case("1450-1500"):{
        return SagaDate._1450_1500;
      }
      case("1500-1550"):{
        return SagaDate._1500_1550;
      }
      default:{
        return SagaDate.UNDEFINED;
      }
    }
  }

  fillInputFields(){
    this.title.setValue(this.activeSagaVersion.title);
    this.description.setValue(this.activeSagaVersion.description);
    this.date.setValue(this.mapToUi(this.activeSagaVersion.date));
  }

  emptyInputFields(){
    this.title.setValue("");
    this.description.setValue("");
    this.date.setValue('Select a date:');

  }

  resetValidators(){
      this.title.clearValidators();
      this.title.addValidators([Validators.required, titleUnique(this.sagaEntry.sagaVersions, this.activeSagaVersion.title)]);
      this.title.updateValueAndValidity();
    }

  //---------------
  //  USER CHOICE
  //---------------

  editSagaVersion(id: number){
    this.mode = Mode.EDIT;
    this.selectSagaVersion(id); 
    this.showValidationErrors = false;
    this.fillInputFields();
  }

  addSagaVersion(){
    this.mode = Mode.ADD;
    this.activeSagaVersion = this.initialisedSagaVersion;
    this.showValidationErrors = false;
    this.emptyInputFields();
  }

  selectSagaVersion(id: number){
    let sagaVersion = this.sagaEntry.sagaVersions.find(i => i.id === id);
    if (typeof sagaVersion === 'undefined') {
      console.log("Saga not found");
      this.activeSagaVersion = this.initialisedSagaVersion;
    }
    else{
      this.activeSagaVersion = sagaVersion;
    }
  }

  submitAddOrEdit(){
    this.resetValidators();
    if (this.title.valid && this.date.valid){
      var editAddModal = document.getElementById('editAddSaga');
      if (editAddModal != null){
        var modal = Modal.getInstance(editAddModal);
        modal?.toggle();
      }

      if (this.mode === Mode.EDIT){
        this.updateSagaVersion();
      }
      if (this.mode === Mode.ADD){
        this.postSagaVersion();
      }
    }
    else{
      this.showValidationErrors = true;
    }
  }

  //---------------
  //     CRUD
  //---------------

  //FILL VM
  formToVm(){
    this.activeSagaVersion.sagaId = this.sagaEntry.id;
    this.activeSagaVersion.title = this.title.value;

    //Ugly fix until Quill releases update
    this.activeSagaVersion.description = String(this.description.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
    this.activeSagaVersion.date = this.mapFromUi(this.date.value);
  }

  //CREATE
  postSagaVersion(){

    this.formToVm();
    this.sagasService.postSagaVersion(this.sagaMapper.mapSagaVersionVmToDto(this.activeSagaVersion)).subscribe({
      next: receivedSagaVersion => {
        console.log("saga version posted: " + receivedSagaVersion);
        this.displaySaga();
      },
      error: err => console.log("Error with posting saga version: " + err)
    })
  }

  //READ
  displaySaga(){
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.sagasService.getSagaById(id).subscribe({
          next: receivedEntry => {
            this.sagaEntry = receivedEntry;
            this.sagaVersions = this.sagaEntry.sagaVersions.sort((a, b) => a.title.localeCompare(b.title));
          },
          error: err => console.log(err)
        });
      }
    });
  }

  //UPDATE
  updateSagaVersion(){
    
    this.formToVm();
    this.sagasService.putSagaVersion(this.sagaMapper.mapSagaVersionVmToDto(this.activeSagaVersion)).subscribe({
      next: receivedSagaVersion => {
        console.log("Saved successfully! " + receivedSagaVersion);
        this.displaySaga();
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

  //DELETE
  deleteSagaVersion(){
  this.sagasService.deleteSagaVersion(this.activeSagaVersion.id).subscribe({
    next: sagaVersion => this.displaySaga(),
    error: err=> console.log("problem with deleting")
    })
  }
}

  //---------------
  // CUSTOM VALIDATION
  //---------------

export function titleUnique(sagas: ISagaVersionVm[], sagaName: string): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      if (!value) {
          return null;
      }

    let saga = sagas.find(saga => saga.title.toLowerCase() === value.toLowerCase());
    if (typeof saga === 'undefined') {
      return null;
    }
    else if(value !== sagaName){
      return { nameNotUnique: true };
    }
    else{
      return null;
    }
  }
}

export function dateNotSelected(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      console.log("date value: " + value);

      if (!value) {
          return null;
      }

      if (value === "Select a date:"){
        return { dateNotSelected: true };
      }
      else{
        return null;
      }
  }
}