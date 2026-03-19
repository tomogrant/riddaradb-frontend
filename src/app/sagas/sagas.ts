import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagasService } from './sagas.service';
import { BibService } from '../bib entries/bib.service';
import { ISaga } from './ISaga';
import { IBib } from '../bib entries/IBib';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule, RouterModule],
  templateUrl: './sagas.html',
  styleUrl: './sagas.css',
  providers: [SagasService]
})
export class SagasComponent implements OnInit {
  constructor(private sagasService: SagasService, 
              private bibService: BibService) {}

  pageTitle = 'Sagas';
  sagas: ISaga[] = [];
  bibEntries: { [id: number]: IBib } = {};  // Cache for bib entries

  ngOnInit() {
    this.displaySagas();
  }

  displaySagas() {
    this.sagasService.getSagas().subscribe({
      next: receivedSagas => {
        this.sagas = receivedSagas;
        // Fetch all unique bib entries after sagas are loaded
        this.fetchAllBibEntries();
      },
      error: err => console.log('Error fetching sagas: ' + err)
    });
  }

  fetchAllBibEntries() {
    // Collect all unique bibIds from all sagas
    const allBibIds = [...new Set(this.sagas.flatMap(saga => saga.bibIds))];
    allBibIds.forEach(id => {
      if (!this.bibEntries[id]) {  // Avoid duplicate fetches
        this.bibService.getBibEntryById(id).subscribe({
          next: receivedBib => {
            this.bibEntries[id] = receivedBib;
          },
          error: err => console.log('Error fetching bib entry: ' + err)
        });
      }
    });
  }

}
