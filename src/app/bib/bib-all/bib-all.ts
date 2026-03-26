import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../bib.service';
import { IBib } from '../IBib';
import { ISaga } from '../../sagas/ISaga';
import { SagasService } from '../../sagas/sagas.service';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule, RouterModule],
  templateUrl: './bib-all.html',
  styleUrl: './bib-all.css',
  providers: [BibService]
})
export class BibAll {
  constructor(private bibService: BibService, private sagaService: SagasService) {}

  pageTitle = 'Bibliography entries';
  bibs: IBib[] = [];
  sagas: { [id: number]: ISaga } = {};  // Cache for saga entries

ngOnInit() {
    // Fetch bibs data when the component initializes
    this.displayBibs();
  }

displayBibs(){
      this.bibService.getBibEntries().subscribe({
          next: receivedBibs => {
              this.bibs = receivedBibs;
              // Fetch all unique saga entries after bibs are loaded
              this.fetchAllSagas();
          },
          error: err => console.log('Error fetching bibs: ' + err)
      });
  }

    fetchAllSagas() {
    // Collect all unique bibIds from all sagas
    const allSagaIds = [...new Set(this.bibs.flatMap(bib => bib.sagaIds))];
    allSagaIds.forEach(id => {
      if (!this.sagas[id]) {  // Avoid duplicate fetches
        this.sagaService.getSagaById(id).subscribe({
          next: receivedSaga => {
            this.sagas[id] = receivedSaga;
          },
          error: err => console.log('Error fetching saga: ' + err)
        });
      }
    });
  }

}
