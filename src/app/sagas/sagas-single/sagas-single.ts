import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IBib } from '../../bib/IBib';
import { ISagaVm } from '../ISagaVm';
import { SagaService } from '../saga.service';
import { ISagaVersionDto } from '../ISagaVersionDto';

@Component({
  selector: 'app-saga-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sagas-single.html',
})
export class SagasSingle implements OnInit {
  sagaEntry?: ISagaVm;

  constructor(
    private route: ActivatedRoute,
    private sagasService: SagaService
  ) {}

  ngOnInit() {
    // Subscribe to route parameters to get the saga ID;
    // If the ID exists, fetch the saga entry and then load its versions and associated bibs.
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.sagasService.getSagaById(id).subscribe(receivedEntry => {
          this.sagaEntry = receivedEntry;
          console.log(receivedEntry.title);
        });
      }
    });
  }


}