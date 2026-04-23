import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagaService } from '../saga.service';
import { ISagaVm } from '../ISagaVm';
import { SagaMapper } from '../saga-mapper';
import { ISagaVersionVm } from '../ISagaVersionVm';

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
  sagas: ISagaVm[] = [];

  initialisedSaga: ISagaVm = {
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
  
  activeSaga: ISagaVm = this.initialisedSaga;

  editForm = new FormGroup(
    {title: new FormControl('', [Validators.required, titleUnique(this.sagas)])
    });

    get title() {
    return this.editForm.get('title') as FormControl;
    }

  // bib: IBib = {
  //   id: 0,
  //   authors: "Author",
  //   title: "Title",
  //   editors: "Editor",
  //   book: "Book",
  //   bookSeries: "Series",
  //   numOfVolumes: 1,
  //   placeOfPublication: "Place",
  //   publisher: "Publisher",
  //   publicationYear: "Year",
  //   pageNumbers: "10-100",
  //   sagaVersionIds: []
  // }

  ngOnInit() {
      this.displaySagas();

    // this.bibService.postBib(this.bib).subscribe({
    //   next: receivedBib => {
    //     console.log ("bib posted successfully: " + JSON.stringify(receivedBib));
    //         this.sagaVersion.bibDto.push(receivedBib);
    //     this.sagasService.postSaga(this.sagaMapper.mapSagaVmToDto(this.saga)).subscribe({
    //       next: receivedSaga => {
    //         console.log('Saga posted successfully: ' + JSON.stringify(receivedSaga));
    //         this.sagaVersion.sagaId = receivedSaga.id;
    //         this.sagasService.postSagaVersion(this.sagaMapper.mapSagaVersionVmToDto(this.sagaVersion)).subscribe({
    //           next: receivedSagaVersion => {
    //             console.log('Saga version posted successfully: ' + JSON.stringify(receivedSagaVersion));
    //             this.displaySagas();
    //       },
    //   error: err => console.log('Error posting saga version: ' + err)
    // });
    //   },
    //   error: err => console.log('Error posting saga version: ' + err)
    // });
    //   },
    //   error: error => console.log("error!" + error)
    // });
  }

  resetValidators(){
    this.title.clearValidators();
    this.title.addValidators([Validators.required, titleUnique(this.sagas)]);
    this.title.updateValueAndValidity();
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

  fillInputFields(){
    this.title.setValue(this.activeSaga.title);
  }

  emptyInputFields(){
    this.title.setValue("");
  }

  //CRUD

  //CREATE
  postSaga(){
    this.activeSaga = this.initialisedSaga;
    this.activeSaga.title = this.title.value;
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
        this.resetValidators();
      },
      error: err => console.log('Error fetching sagas: ' + err)
    });
  }

  //UPDATE
  updateSaga(){
    this.activeSaga.title = this.title.value;
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
  deleteSaga(id: number){
    console.log("deleting saga with id " + id);
    this.sagasService.deleteSaga(id).subscribe({
      next: saga => this.displaySagas(),
      error: err=> console.log("problem with deleting")
      })
    }
}

  //CUSTOM VALIDATION
  export function titleUnique(sagas: ISagaVm[]): ValidatorFn {
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