import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../bib.service';
import { IBib } from '../IBib';
import { ISagaVm } from '../../sagas/ISagaVm';
import { SagaService } from '../../sagas/saga.service';
import { ISagaVersionDto } from '../../sagas/ISagaVersionDto';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule, RouterModule],
  templateUrl: './bib-all.html',
  styleUrl: './bib-all.css',
  providers: [BibService]
})
export class BibAll {
  constructor(private bibService: BibService, private sagaService: SagaService) {}

  pageTitle = 'Bibliography entries';
  bibs: IBib[] = [];
  sagas: { [id: number]: ISagaVm } = {};  // Cache for saga entries
  sagaVersions: { [id: number]: ISagaVersionDto } = {};  // Cache for saga version entries

ngOnInit() {
    // Fetch bibs data when the component initializes
    this.displayBibs();
  }

displayBibs(){
      this.bibService.getBibEntries().subscribe({
          next: receivedBibs => {
              this.bibs = receivedBibs;
              // Fetch all unique saga entries after bibs are loaded
          },
          error: err => console.log('Error fetching bibs: ' + err)
      });
  }


}
