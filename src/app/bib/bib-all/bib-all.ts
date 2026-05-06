import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { Mode } from '../../shared/Enums';
import { BibService } from '../bib.service';
import { IBib, PublicationType } from '../IBib';
import { ISagaVm } from '../../sagas/common/ISagaVm';
import { SagaService } from '../../sagas/common/saga.service';
import { ISagaVersionDto } from '../../sagas/common/ISagaVersionDto';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './bib-all.html',
  styleUrl: './bib-all.css',
  providers: [BibService]
})
export class BibAll {
  constructor(private bibService: BibService, 
              private sagaService: SagaService,
              private router: Router
            ) {}

  pageTitle = 'Bibliography entries';
  bibs: IBib[] = [];

  editionsTranslations: IBib[] = [];
  secondary: IBib[] = [];
  other: IBib[] = [];

  publicationTypesUi: string[] = [];

  readonly PublicationType = PublicationType;
  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  ngOnInit() {
      this.displayBibs();
    }

  sortBibEntries(){
    for (let bib of this.bibs){
      switch(bib.publicationType){
        case (PublicationType.EDITION):
        case (PublicationType.TRANSLATION):
          this.editionsTranslations.push(bib);
          break;
        case (PublicationType.OTHER):
          this.other.push(bib);
          break;
        case (PublicationType.UNDEFINED):
          console.log("Bibliography entry " + bib.authors + ", " + bib.title + " is undefined!");
          break;
        default:
          this.secondary.push(bib);
          break;
      }
    }
  }

  addBib(){
    this.router.navigate([`bib/action/add`]);
  }

  //READ
  displayBibs(){
    this.bibService.getBibEntries().subscribe({
      next: receivedBibs => {
        this.bibs = receivedBibs.sort((a, b) => a.authors.localeCompare(b.authors));
        this.sortBibEntries();
      },
      error: err => console.log('Error fetching bibs: ' + err)
    });
  }
}