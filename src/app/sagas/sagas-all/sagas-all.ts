import { FormsModule } from '@angular/forms';
import { Component, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagaService } from '../saga.service';
import { IBib } from '../../bib/IBib';
import { BibService } from '../../bib/bib.service';
import { ISagaVm } from '../ISagaVm';
import { SagaMapper } from '../saga-mapper';
import { ISagaVersionVm } from '../ISagaVersionVm';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sagas-all.html',
  styleUrl: './sagas-all.css',
  providers: [SagaService, BibService]
})
export class SagasAll implements OnInit {
  constructor(private sagasService: SagaService, 
              private bibService: BibService,
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
  
  activeSaga: ISagaVm = {
    id: 0,
    title: '',
    description: '',
    isTranslated: false,
    sagaVersions: []
  };

  inputTitle: string = "";

  // sagaVersion: ISagaVersionVm = {
  //   id: 0,
  //   title: 'Saga version title',
  //   description: 'Saga version description',
  //   date: 1300,
  //   isTranslated: false,
  //   sagaId: 0,
  //   bibDto: [],
  //   folkloreIds: [],
  //   personIds: [],
  //   placeIds: [],
  //   objectIds: [],
  //   msIds: []
  // };

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

  displaySagas() {
    this.sagasService.getSagas().subscribe({
      next: receivedSagas => {
        this.sagas = receivedSagas.sort((a, b) => a.title.localeCompare(b.title));
      },
      error: err => console.log('Error fetching sagas: ' + err)
    });
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
    this.inputTitle = this.activeSaga.title;
  }

  emptyInputFields(){
    this.inputTitle = "";
  }

  postSaga(){
      this.activeSaga = this.initialisedSaga;
      this.activeSaga.title = this.inputTitle;
      console.log(this.sagaMapper.mapSagaVmToDto(this.activeSaga));
      this.sagasService.postSaga(this.sagaMapper.mapSagaVmToDto(this.activeSaga)).subscribe({
      next: receivedSaga => {
        console.log("Saved successfully! " + receivedSaga);
        this.displaySagas();
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

  updateSaga(){
    this.activeSaga.title = this.inputTitle;
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

  deleteSaga(id: number){
    console.log("deleting saga with id " + id);
    this.sagasService.deleteSaga(id).subscribe({
      next: saga => this.displaySagas(),
      error: err=> console.log("problem with deleting")
      })
    }
}
