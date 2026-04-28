import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BibService } from '../bib.service';
import { IBib } from '../IBib';
import { ISagaVm } from '../../sagas/common/ISagaVm';
import { SagaService } from '../../sagas/common/saga.service';
import { ISagaVersionDto } from '../../sagas/common/ISagaVersionDto';

@Component({
  selector: 'app-bibs',
  imports: [RouterModule],
  templateUrl: './bib-all.html',
  styleUrl: './bib-all.css',
  providers: [BibService]
})
export class BibAll {
  constructor(private bibService: BibService, 
              private sagaService: SagaService) {}

  pageTitle = 'Bibliography entries';
  bibs: IBib[] = [];

  initialisedBib: IBib = {
    id: 0,
    authors: "",
    title: "",
    editors: "",
    book: "",
    bookSeries: "",
    numOfVolumes: 0,
    placeOfPublication: "",
    publisher: "",
    publicationYear: "",
    pageNumbers: "",
    sagaVersionIds: []
  }

  activeBib: IBib = this.initialisedBib;

  ngOnInit() {
      this.displayBibs();
    }


  addBib(){
    
  }

  //CREATE
  postBib(){
    this.bibService.postBib(this.activeBib).subscribe({
      next: receivedBib => {
        console.log("saga version posted: " + receivedBib);
        this.displayBibs();
      },
      error: err => console.log("Error with posting bib entry: " + err)
    })
  }

  //READ
  displayBibs(){
    this.bibService.getBibEntries().subscribe({
      next: receivedBibs => {
        this.bibs = receivedBibs;
      },
      error: err => console.log('Error fetching bibs: ' + err)
    });
  } 


}
