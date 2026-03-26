import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../bib.service';
import { IBib } from '../IBib';
import { ISaga } from '../../sagas/ISaga';
import { SagasService } from '../../sagas/sagas.service';

@Component({
  selector: 'app-bib-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bib-single.html',
})
export class BibSingle implements OnInit {
  bibEntry?: IBib;
  sagaEntries: { [id: number]: ISaga } = {};  // Cache for saga entries

  constructor(
    private route: ActivatedRoute,
    private bibService: BibService,
    private sagasService: SagasService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.bibService.getBibEntryById(id).subscribe(receivedEntry => {
          this.bibEntry = receivedEntry;
          this.fetchAllSagas();
        });
      }
      console.log(this.bibEntry?.sagaIds);
    });
  }

  fetchAllSagas() {
    console.log('Fetching all sagas');
    // Collect all sagas belonging to this bib
    this.bibEntry?.sagaIds.forEach(id => {
      console.log(id);
      this.sagasService.getSagaById(id).subscribe({
       next: receivedSaga => {
          this.sagaEntries[id] = receivedSaga;
          console.log(`Saga entry with ID ${id}: ` + JSON.stringify(receivedSaga));
      },
          error: err => console.log('Error fetching saga entry: ' + err)
        });
      
    });
  }
}