import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagaService } from '../common/saga.service';
import { SagaMapper } from '../common/saga.mapper';
import { ISagaVm } from '../common/ISagaVm';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule, RouterModule],
  templateUrl: './sagas-all.html',
  styleUrl: './sagas-all.css'
})

export class SagasAll implements OnInit {
  constructor(private sagaService: SagaService, 
              private sagaMapper: SagaMapper,
              private router: Router) {}

  pageTitle = 'Sagas';

  sagas: ISagaVm[] = [];
  
  ngOnInit() {
      this.displaySagas();
  }

  //---------------
  //     CRUD
  //---------------

  addSaga(){
    this.router.navigate([`sagas/action/add`]);
  }

  //READ
  displaySagas() {
    this.sagaService.getSagas().subscribe({
      next: receivedSagas => {
        for (const saga of receivedSagas){
          this.sagas.push(this.sagaMapper.mapSagaResponseDtoToVm(saga));
        }

        this.sagas.sort((a, b) => a.title.localeCompare(b.title));
      },
      error: err => console.log('Error fetching sagas: ' + err)
    });
  }

}

  