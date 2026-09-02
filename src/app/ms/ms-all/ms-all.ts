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

  //Forms
  editForm = new FormGroup({
      id: new FormControl<number | null>({value: null, disabled: true}),
      name: new FormControl<string>(''),
  });

  get name() {
    return this.editForm.get('name') as FormControl;
  }

  
  filterForm = new FormGroup({
    filter: new FormControl('', {nonNullable: true})
  });

  get filter(){
    return this.filterForm.get('filter') as FormControl;
  }

  //Variables
  showValidationErrors: boolean = false;

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  mss: IMs[] = [];
  filteredMss: IMs[] = [];

  repositoryDto: IMsRepositoryDto = this.initialiseRepository();
  repositoriesDto: IMsRepositoryDto[] = [];
  
  repositoriesVm: IMsRepositoryVm[] = [];
  filteredRepositoriesVm: IMsRepositoryVm[] = [];

  repositoriesVmMap: Map<number, IMsRepositoryVm> = new Map<number, IMsRepositoryVm>;
  msMap: Map<number, IMs> = new Map<number, IMs>;

  ngOnInit() {
      this.displayRepositories();

      this.filter.valueChanges.pipe()
        .subscribe(value => this.updateFilter(value));
  }

  //Builds repository view models and assigns manuscripts to them 
  //Alphabetises manuscripts and their repositories 
  sortManuscripts(){
    this.repositoriesVm = [];

    this.mss.forEach(ms => {
      if (ms.id) 
        this.msMap.set(ms.id, ms)
      });

    this.repositoriesDto.forEach(repoDto => {
      var repoVm: IMsRepositoryVm = this.initialiseRepositoryVm();
      if (repoDto.id) repoVm.id = repoDto.id;
      repoVm.name = repoDto.name;

      repoDto.msIds.forEach(id => {
        var ms = this.msMap.get(id);
        if (ms?.id && ms?.shelfmark){
          repoVm.manuscripts.push({
            id: ms.id,
            name: ms?.name,
            shelfmark: ms.shelfmark
          });
        }
      });

      repoVm.manuscripts.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
      this.repositoriesVm.push(repoVm);
      this.repositoriesVmMap.set(repoVm.id, repoVm);
    });

    this.repositoriesVm.sort((a, b) => a.name.localeCompare(b.name));
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

  initialiseRepositoryVm(){
    return {
      id: 0,
      name: '',
      manuscripts: [],
      accordionOpen: false
    }
  }

  updateFilter(searchTerm: string) {
    const cleanTerm = searchTerm?.trim().toLowerCase();

    if (!cleanTerm) {
      this.filteredRepositoriesVm = this.repositoriesVm;
      return;
    }

    console.log("Search term: " + cleanTerm);

    this.filteredRepositoriesVm = this.repositoriesVm
      .map(repo => {
        //Keep only matching MSs
        const matchingManuscripts = repo.manuscripts.filter(ms =>
          ms.shelfmark.toLowerCase().includes(cleanTerm) ||
          ms.name?.toLowerCase().includes(cleanTerm)
        );

        //Return a shallow copy of the repository with the filtered MS list
        return {
          ...repo,
          manuscripts: matchingManuscripts
        };
      })
      //Exclude repositories that end up with zero matching MSs
      .filter(repo => repo.manuscripts.length > 0);
    }

    submitAddOrEdit(){
      this.name.clearValidators();
      this.name.addValidators(Validators.required);
      this.name.updateValueAndValidity();

    if (this.editForm.valid){
      this.closeAddEditModal();

      this.repositoryDto.name = this.name.value;

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
        this.repositoriesDto = receivedRepositories;
        this.msService.getMsEntries().subscribe({
          next: receivedManuscripts => {
            this.mss = receivedManuscripts;
            this.sortManuscripts();
            this.updateFilter('');
          },
          error: err => console.log("Error fetching mss: " + err)
        });
      },
      error: err => console.log('Error fetching repositories: ' + err)
    });
  }

  postMsRepository(){
    this.msService.postMsRepository(this.repositoryDto).subscribe({
      next: repo => {
        console.log("Saved successfully! " + repo);

        //Add new repo to collection and repo map
        var repoVm: IMsRepositoryVm = this.initialiseRepositoryVm();
        if (repo.id) repoVm.id = repo.id;
        repoVm.name = repo.name;
        this.repositoriesVm.push(repoVm);
        this.repositoriesVmMap.set(repoVm.id, repoVm);
        this.repositoriesVm.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: err => {
        console.log("Problem with saving.");
      }
    });
  }

  updateMsRepository(){
    this.msService.putMsRepository(this.repositoryDto).subscribe({
      next: repo => {
        console.log("Updated successfully! " + repo);
        var repoToChange = this.repositoriesVm.find(repo => repo.id == this.repositoryDto.id);
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