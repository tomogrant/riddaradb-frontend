import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BibService } from '../bib entries/bib.service';
import { IBib } from '../bib entries/IBib';

@Component({
  selector: 'app-bib-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'bib-entry.component.html',
})
export class BibEntryComponent implements OnInit {
  bibEntry?: IBib;

  constructor(
    private route: ActivatedRoute,
    private bibService: BibService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.bibService.getBibEntryById(id).subscribe(receivedEntry => {
          this.bibEntry = receivedEntry;
        });
      }
    });
  }
}