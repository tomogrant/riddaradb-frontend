import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../../bib/bib.service';
import { IBib } from '../../bib/IBib';
import { ISaga } from '../ISaga';
import { SagasService } from '../sagas.service';

@Component({
  selector: 'app-saga-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sagas-single.html',
})
export class SagasSingle implements OnInit {
  sagaEntry?: ISaga;
  bibEntries: { [id: number]: IBib } = {};  // Cache for bib entries

  constructor(
    private route: ActivatedRoute,
    private bibService: BibService,
    private sagasService: SagasService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.sagasService.getSagaById(id).subscribe(receivedEntry => {
          this.sagaEntry = receivedEntry;
          this.fetchAllBibs();
        });
      }
      console.log(this.sagaEntry?.bibIds);
    });
  }

  fetchAllBibs() {
    console.log('Fetching all bibs');
    // Collect all bibs belonging to this saga
    this.sagaEntry?.bibIds.forEach(id => {
      console.log(id);
      this.bibService.getBibEntryById(id).subscribe({
       next: receivedBib => {
          this.bibEntries[id] = receivedBib;
          console.log(`Bib entry with ID ${id}: ` + JSON.stringify(receivedBib));
      },
          error: err => console.log('Error fetching bib entry: ' + err)
        });
      
    });
  }
}