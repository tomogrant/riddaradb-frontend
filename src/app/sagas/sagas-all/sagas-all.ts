import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SagaService } from '../common/saga.service';
import { SagaMapper } from '../common/saga.mapper';
import { Mode } from '../../shared/Enums';
import { ISagaVm } from '../common/ISagaVm';

@Component({
  selector: 'app-sagas',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sagas-all.html',
  styleUrl: './sagas-all.css',
  providers: [SagaService]
})

export class SagasAll implements OnInit {
  constructor(private sagasService: SagaService, 
              private sagaMapper: SagaMapper,
              private router: Router) {}

  pageTitle = 'Sagas';

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  showValidationErrors: boolean = false;

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
    this.sagasService.getSagas().subscribe({
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

  