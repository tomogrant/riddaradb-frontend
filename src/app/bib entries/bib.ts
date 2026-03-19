import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BibService } from './bib.service';
import { IBib } from './IBib';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule],
  templateUrl: './bib.html',
  styleUrl: './bib.css',
  providers: [BibService]
})
export class BibComponent {
  constructor(private bibService: BibService) {}

  pageTitle = 'Bibs';
  bibs: IBib[] = [];

ngOnInit() {
    // Fetch bibs data when the component initializes
    this.displayBibs();
  }

      displayBibs(){
        this.bibService.getBibEntries().subscribe({
            next: receivedBibs => {
                this.bibs = receivedBibs;
            },
            error: err => console.log('Error fetching bibs: ' + err)
        });
    }

}
