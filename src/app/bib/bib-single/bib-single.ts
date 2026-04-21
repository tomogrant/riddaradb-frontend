import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../bib.service';
import { IBib } from '../IBib';
import { SagaService } from '../../sagas/saga.service';
import { ISagaVersionDto } from '../../sagas/ISagaVersionDto';
import { ISagaVm } from '../../sagas/ISagaVm';

@Component({
  selector: 'app-bib-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bib-single.html',
})
export class BibSingle implements OnInit {
  bibEntry?: IBib;
  sagas: { [id: number]: ISagaVm } = {};  // Cache for saga entries
  sagaVersions: { [id: number]: ISagaVersionDto } = {};  // Cache for saga entries

  constructor(
    private route: ActivatedRoute,
    private bibService: BibService,
    private sagasService: SagaService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.bibService.getBibEntryById(id).subscribe(receivedEntry => {
          this.bibEntry = receivedEntry;
        });
      }
      console.log(this.bibEntry?.sagaVersionIds);
    });
  }
}