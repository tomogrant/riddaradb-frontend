import { FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MsService } from '../common/ms.service';
import { CommonModule } from '@angular/common';
import { IMs } from '../common/IMs';

@Component({
  selector: 'app-ms-all',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './ms-all.html',
  providers: [MsService]
})

export class MsAll{

    constructor(
        private router: Router,
        private msService: MsService

    ){}

    mss: IMs[] = [];

    filteredMss: IMs[] = [];

  filterForm = new FormGroup({
    filter: new FormControl('', {nonNullable: true})
});

  get filter(){
    return this.filterForm.get('filter') as FormControl;
  }

  ngOnInit() {
      this.displayMss();

      this.filter.valueChanges.pipe()
        .subscribe(value => this.updateFilter(value));
    }

  addMs(){
    this.router.navigate([`ms/action/add`]);
  }

  updateFilter(searchTerm: string){
    console.log("search term: " + searchTerm);
    //Filtered, alphabetised results based on search term. 
    const filteredResults = this.mss.filter(ms =>
      ms.shelfmark.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
    
    this.filteredMss = filteredResults;
  }

  //READ
  displayMss(){
    this.msService.getMsEntries().subscribe({
      next: receivedMss => {
        this.mss = receivedMss;

        this.updateFilter('');
      },
      error: err => console.log('Error fetching mss: ' + err)
    });
  }
}