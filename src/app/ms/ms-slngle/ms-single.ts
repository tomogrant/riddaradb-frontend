import { FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { Component } from '@angular/core';
import { Modal } from 'bootstrap';
import { RouterModule, Router } from '@angular/router';
import { MsService } from '../common/ms.service';
import { CommonModule } from '@angular/common';
import { IMs } from '../common/IMs';
import { IMsRepositoryVm } from '../common/IMsRepositoryVm';
import { Mode } from '../../shared/Enums';
import { IMsRepositoryDto } from '../common/IMsRepositoryDto';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({
  selector: 'app-ms-single',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './ms-single.html',
  styleUrl: './ms-single.css'
})

export class MsSingle{

  constructor(
      private router: Router,
      private msService: MsService

  ){}

}