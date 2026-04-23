import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IBib } from '../../bib/IBib';
import { ISagaVm } from '../ISagaVm';
import { SagaService } from '../saga.service';
import {ISagaVersionVm } from '../ISagaVersionVm'
import { SagaMapper } from '../saga-mapper';

@Component({
  selector: 'app-saga-entry',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sagas-single.html',
  providers: [SagaService]
})
export class SagasSingle implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private sagasService: SagaService,
    private sagaMapper: SagaMapper
  ) {}

    sagaEntry: ISagaVm = {
    id: 0,
    title: '',
    description: '',
    isTranslated: false,
    sagaVersions: []
  };

  initialisedSagaVersion: ISagaVersionVm = {
    id: 0,
    title: '',
    description: '',
    date: 0,
    isTranslated: false,
    sagaId: 0,
    bibDto: [],
    folkloreIds: [],
    personIds: [],
    placeIds: [],
    objectIds: [],
    msIds: []
  };

  activeSagaVersion: ISagaVersionVm = this.initialisedSagaVersion;

  editForm = new FormGroup({
    title: new FormControl('', [Validators.required, titleUnique(this.sagaEntry.sagaVersions)]),
    description: new FormControl(''),
    date: new FormControl(''),
    isTranslated: new FormControl(false)
  });

  get title() {
  return this.editForm.get('title') as FormControl;
  }

  ngOnInit() {
    this.displaySaga();
  }

  //SELECT SAGA VERSION
  selectSagaVersion(id: number){
    let sagaVersion = this.sagaEntry.sagaVersions.find(i => i.id === id);
    if (typeof sagaVersion === 'undefined') {
      console.log("Saga not found");
      this.activeSagaVersion = this.initialisedSagaVersion;
    }
    else{
      console.log("saga with ID " + sagaVersion.id + " found.");
      this.activeSagaVersion = sagaVersion;
    }
  }

  postSagaVersion(){
    this.activeSagaVersion = this.initialisedSagaVersion;
    this.activeSagaVersion.title = this.sagaEntry.title + " " + this.sagaEntry.sagaVersions.length + 1;
    this.activeSagaVersion.sagaId = this.sagaEntry.id;
    this.sagasService.postSagaVersion(this.sagaMapper.mapSagaVersionVmToDto(this.activeSagaVersion)).subscribe({
      next: receivedSagaVersion => console.log("saga version posted: " + receivedSagaVersion),
      error: err => console.log("Error with posting saga version: " + err)
    })
  }

  //READ
  displaySaga(){
    // Subscribe to route parameters to get the saga ID;
    // If the ID exists, fetch the saga entry and then load its versions and associated bibs.
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.sagasService.getSagaById(id).subscribe(receivedEntry => {
          this.sagaEntry = receivedEntry;
        });
      }
    });
  }

  //UPDATE
  updateSagaVersion(){
    this.activeSagaVersion.title = this.title.value;
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
  deleteSagaVersion(id: number){
  console.log("deleting saga with id " + id);
  this.sagasService.deleteSagaVersion(id).subscribe({
    next: sagaVersion => this.displaySaga(),
    error: err=> console.log("problem with deleting")
    })
  }
}

export function titleUnique(sagas: ISagaVersionVm[]): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      if (!value) {
          return null;
      }

    let saga = sagas.find(saga => saga.title.toLowerCase() === value.toLowerCase());
    if (typeof saga === 'undefined') {
      console.log("Name is unique");
      return null;
    }
    else{
      return { nameNotUnique: true };
    }
  }
}