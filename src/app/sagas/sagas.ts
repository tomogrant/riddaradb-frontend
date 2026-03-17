import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SagasService } from './sagas.service';
import { ISaga } from './ISaga';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule],
  templateUrl: './sagas.html',
  styleUrl: './sagas.css',
  providers: [SagasService]
})
export class SagasComponent {
  constructor(private sagasService: SagasService) {}

  pageTitle = 'Sagas';
  sagas: ISaga[] = [];

ngOnInit() {
    // Fetch sagas data when the component initializes
    this.displaySagas();
  }

      displaySagas(){
        this.sagasService.getSagas().subscribe({
            next: receivedSagas => {
                this.sagas = receivedSagas;
            },
            error: err => console.log('Error fetching sagas: ' + err)
        });
    }

}
