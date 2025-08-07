import { Component } from '@angular/core';
import { SagasService } from './sagas.service';

@Component({
  selector: 'app-sagas',
  imports: [],
  templateUrl: './sagas.html',
  styleUrl: './sagas.css',
  providers: [SagasService]
})
export class SagasComponent {
  constructor(private sagasService: SagasService) {}

ngOnInit() {
    // Fetch sagas data when the component initializes
    this.sagasService.getSagas().subscribe({
      next: (data) => {
        console.log('Sagas data:', data);
      },
      error: (error) => {
        console.error('Error fetching sagas data:', error);
      }
    });
  }
}
