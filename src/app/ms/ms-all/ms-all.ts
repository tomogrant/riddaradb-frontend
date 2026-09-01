import { FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { Component } from '@angular/core';
import { Modal } from 'bootstrap';
import { RouterModule, Router } from '@angular/router';
import { MsService } from '../common/ms.service';
import { CommonModule } from '@angular/common';
import { IMs } from '../common/IMs';
import { IMsRepository } from '../common/IMsRepository';
import { Mode } from '../../shared/Enums';

@Component({
  selector: 'app-ms-all',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './ms-all.html'
})

export class MsAll{

  constructor(
      private router: Router,
      private msService: MsService

  ){}


  editForm = new FormGroup({
      id: new FormControl<number | null>({value: null, disabled: true}),
      name: new FormControl<string>(''),
  });

  get name() {
    return this.editForm.get('name') as FormControl;
  }

  showValidationErrors: boolean = false;

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  mss: IMs[] = [];
  filteredMss: IMs[] = [];

  repository: IMsRepository = this.initialiseRepository();
  repositories: IMsRepository[] = [];

  filterForm = new FormGroup({
    filter: new FormControl('', {nonNullable: true})
  });

  get filter(){
    return this.filterForm.get('filter') as FormControl;
  }

  ngOnInit() {
      this.displayRepositories();

      this.filter.valueChanges.pipe()
        .subscribe(value => this.updateFilter(value));
    }

  addRepository(){
    this.mode = Mode.ADD;
    this.editForm.reset();
    this.openAddEditModal();
  }

  openAddEditModal(){
    var addEditModal = document.getElementById('addEditRepository');
    if (addEditModal != null){
      var modal = Modal.getOrCreateInstance(addEditModal);
      if (modal != null){
        modal.show();
      }
    }
  }

  closeAddEditModal(){
    var addEditModal = document.getElementById('addEditRepository');
    if (addEditModal != null){
      var modal = Modal.getInstance(addEditModal);
      if (modal != null){
        modal.hide();
      }
    }
  }

  initialiseRepository(){
    return {
      id: null,
      name: '',
      msIds: []
    }
  }

  updateFilter(searchTerm: string){
    console.log("search term: " + searchTerm);
    //Filtered, alphabetised results based on search term. 
    const filteredResults = this.mss.filter(ms =>
      ms.shelfmark.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
    
    this.filteredMss = filteredResults;
  }

    submitAddOrEdit(){
      this.name.clearValidators();
      this.name.addValidators(Validators.required);
      this.name.updateValueAndValidity();

    if (this.editForm.valid){
      this.closeAddEditModal();

      this.repository.name = this.name.value;

      if (this.mode === Mode.ADD){
        this.postMsRepository();
      }
      else if (this.mode === Mode.EDIT){
        this.updateMsRepository();
      }

    }
    else{
      this.showValidationErrors = true;
    }
  }

  //READ
  displayRepositories(){
    this.msService.getMsRepositories().subscribe({
      next: receivedRepositories => {
        this.repositories = receivedRepositories;

        this.updateFilter('');
      },
      error: err => console.log('Error fetching mss: ' + err)
    });
  }

  postMsRepository(){
    this.msService.postMsRepository(this.repository).subscribe({
      next: repo => {
        console.log("Saved successfully! " + repo);
        this.repositories.push(repo);
      },
      error: err => {
        console.log("Problem with saving.");
      }
    });
  }

  updateMsRepository(){
    this.msService.putMsRepository(this.repository).subscribe({
      next: repo => {
        console.log("Updated successfully! " + repo);
        var repoToChange = this.repositories.find(repo => repo.id == this.repository.id);
        if (repoToChange){
          repoToChange.name = repo.name;
        }
      },
      error: err => {
        console.log("Problem with saving.");
      }
    });
  }

}