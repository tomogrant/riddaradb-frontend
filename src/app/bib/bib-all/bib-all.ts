import { FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Mode } from '../../shared/Enums';
import { BibService } from '../common/bib.service';
import { IBib, PublicationType } from '../common/IBib';
import { BibMapper } from '../common/bib.mapper';
import { CommonModule } from '@angular/common';
import { IBibVm } from '../common/IBibVm';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './bib-all.html',
  styleUrl: './bib-all.css'
})

export class BibAll {
  constructor(private bibService: BibService, 
              private bibMapper: BibMapper,
              private router: Router
            ) {}

  bibs: IBib[] = [];

  bibsVm: IBibVm[] = [];
  primarySources: IBibVm[] = [];
  secondarySources: IBibVm[] = [];

  readonly PublicationType = PublicationType;
  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  filterForm = new FormGroup({
    filter: new FormControl('', {nonNullable: true})
});

  get filter(){
    return this.filterForm.get('filter') as FormControl;
  }

  ngOnInit() {
      this.displayBibs();

      this.filter.valueChanges.pipe(debounceTime(250), distinctUntilChanged())
        .subscribe(value => this.updateFilter(value));
    }

  addBib(){
    this.router.navigate([`bib/action/add`]);
  }

  updateFilter(searchTerm: string){
    console.log("search term: " + searchTerm);
    //Filtered, alphabetised results based on search term. 
    const filteredResults = this.bibsVm.filter(bib =>
      bib.bibliographyEntry.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));


    //Further filter into primary and secondary bibliography entries
    this.primarySources = filteredResults.filter(bib => bib.primarySource == true);
    this.secondarySources = filteredResults.filter(bib => bib.primarySource == false);
  }

  //READ
  displayBibs(){
    this.bibService.getBibEntries().subscribe({
      next: receivedBibs => {
        this.bibs = receivedBibs;
        this.bibs.forEach(bib => {
          this.bibsVm.push(this.bibMapper.mapDtoToVm(bib));
        });

        this.updateFilter('');
      },
      error: err => console.log('Error fetching bibs: ' + err)
    });
  }
}