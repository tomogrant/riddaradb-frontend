import {
  FormGroup, FormControl, FormArray, AbstractControl,
  ValidationErrors, ReactiveFormsModule, Validators,
  ValidatorFn
} from '@angular/forms';
import { Collapse, Modal } from 'bootstrap';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill'
import { IBib, PublicationType } from '../../bib/common/IBib';
import { BibService } from '../../bib/common/bib.service';
import { SagaService } from '../common/saga.service';
import { SagaMapper } from '../common/saga.mapper';
import { SagaDate } from '../common/SagaDate';
import { Mode } from '../../shared/Enums';
import { IBibVm } from '../../bib/common/IBibVm';
import { BibMapper } from '../../bib/common/bib.mapper';
import { ISagaVersionVm } from '../common/ISagaVersionVm';
import { IMotif } from '../../motifs/common/IMotif';
import { ISagaVm } from '../common/ISagaVm';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { IMs } from '../../ms/common/IMs';
import { MsService } from '../../ms/common/ms.service';
import { ISagaTitleDto } from '../common/ISagaTitleDto';

@Component({
  selector: 'app-saga-entry',
  imports: [CommonModule, RouterModule, ReactiveFormsModule,
    QuillModule],
  templateUrl: './sagas-single.html',
  styleUrl: './sagas-single.css',
  encapsulation: ViewEncapsulation.None
})
export class SagasSingle implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private sagasService: SagaService,
    private bibService: BibService,
    private msService: MsService,
    private sagaMapper: SagaMapper,
    private bibMapper: BibMapper,
    private router: Router
  ) { }

  readonly PublicationType = PublicationType;
  readonly SagaDate = SagaDate;
  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  sagaEntry: ISagaVm = this.initialiseSaga();

  sagaVersions: ISagaVersionVm[] = [];

  sagaTitles: ISagaTitleDto[] = [];

  sagaVersionTrackingId: number = 0;
  msTrackingId: number = 0;

  bibs: IBib[] = [];
  bibVms: IBibVm[] = [];
  filteredBibVms: IBibVm[] = [];

  motifs: IMotif[] = [];

  manuscripts: IMs[] = [];

  showValidationErrors: boolean = false;

  //---------------
  //  INIT
  //---------------

  ngOnInit() {
    const mode = this.route.snapshot.paramMap.get('mode');

    //ADD MODE
    if (mode == 'add') {
      this.addSaga();
      this.getSagaTitles();
      this.getBibs();
      this.getManuscripts();
    }
    else {
      this.getSaga();
    }

    this.bibFilter.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe({
      next: value => this.updateBibFilter(value)
    });
  }

  //---------------
  //  FORMS
  //---------------

  editForm = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    title: new FormControl<string>('', {validators: [Validators.required, this.sagaTitleUnique()]}),
    translated: new FormControl<boolean>(false),
    description: new FormControl<string>(''),
    sagaVersionForms: new FormArray<FormGroup>([]),
    bibFilter: new FormControl<string>(''),
    bibIds: new FormControl<number[]>([]),
    msForms: new FormArray<FormGroup>([]),
    msFilter: new FormControl<string>('')
  });

  get title() {
    return this.editForm.get('title') as FormControl;
  }

  get translated() {
    return this.editForm.get('translated') as FormControl;
  }

  get description() {
    return this.editForm.get('description') as FormControl;
  }

  get sagaVersionForms() {
    return this.editForm.get('sagaVersionForms') as FormArray;
  }

  get bibFilter() {
    return this.editForm.get('bibFilter') as FormControl;
  }

  get bibIds() {
    return this.editForm.get('bibIds') as FormControl;
  }

  get msForms() {
    return this.editForm.get('msForms') as FormArray;
  }

  createSagaVersionForm(sagaVersion?: ISagaVersionVm) {
    return new FormGroup({
      trackingId: new FormControl<number>(this.sagaVersionTrackingId++, { nonNullable: true }),
      id: new FormControl<number | null>({ value: sagaVersion ? sagaVersion.id : null, disabled: true }),
      title: new FormControl<string>(sagaVersion ? sagaVersion.title : '', { nonNullable: true, validators: [Validators.required, this.sagaVersionTitleUnique()]}),
      date: new FormControl<string>(sagaVersion ? this.mapToUi(sagaVersion.date) : 'Select a date:', { nonNullable: true, validators: this.dateNotSelected() }),
      description: new FormControl<string>(sagaVersion ? sagaVersion.description : ''),
    });
  }

  populateMsForms(){
    this.msForms.clear();
    this.manuscripts.forEach(ms => {
      const msForm = this.createMsForm(ms);
      this.configureMsForm(msForm);

      this.msForms.push(msForm);
    });
  }

  createMsForm(ms: IMs) {
    const msInSaga = this.sagaEntry.manuscripts.find(msDto => msDto.msId == ms.id);
    const selected = !!msInSaga;

    return new FormGroup({
      trackingId: new FormControl<number>(this.sagaVersionTrackingId++, { nonNullable: true }),
      msId: new FormControl<number | null>(ms.id),
      shelfmark: new FormControl<string>(ms.shelfmark),
      folioNumber: new FormControl<string | null>(
        {
          value: msInSaga ? msInSaga.folioNumber : null,
          disabled: !selected
        }, Validators.required),
      selected: new FormControl<boolean>(!!msInSaga),
    });
  }

  configureMsForm(msForm: FormGroup) {
    msForm.get('selected')!.valueChanges.subscribe(selected => {
      const folioNumber = msForm.get('folioNumber');

      if (folioNumber) {
        if (selected) {
          folioNumber?.enable();
        }
        else {
          folioNumber?.disable();
          folioNumber?.setValue(null);
        }
      }
    });
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  openAddEditModal() {
    var addEditModal = document.getElementById('addEditSaga');
    if (addEditModal != null) {
      var modal = Modal.getOrCreateInstance(addEditModal);
      if (modal != null) {
        modal.show();
      }
    }
  }

  closeAddEditModal() {
    var addEditModal = document.getElementById('addEditSaga');
    if (addEditModal != null) {
      var modal = Modal.getInstance(addEditModal);
      if (modal != null) {
        modal.hide();
      }
    }
  }

  openDeleteModal() {
    var deleteModal = document.getElementById('deleteSaga');
    if (deleteModal != null) {
      var modal = Modal.getOrCreateInstance(deleteModal);
      if (modal != null) {
        modal.show();
      }
    }
  }

  closeDeleteModal() {
    var deleteModal = document.getElementById('deleteSaga');
    if (deleteModal != null) {
      var modal = Modal.getInstance(deleteModal);
      if (modal != null) {
        modal.hide();
      }
    }
  }

  initialiseSaga(): ISagaVm {
    return {
      id: null,
      title: '',
      description: '',
      translated: false,
      sagaVersions: [],
      bibIds: [],
      primarySources: [],
      secondarySources: [],
      manuscripts: []
    };
  }

  initialiseSagaVersion(): ISagaVersionVm {
    return {
      id: null,
      title: '',
      description: '',
      date: SagaDate.UNDEFINED,
      sagaId: 0,
      sagaMotifs: []
    };
  }

  bibChecked(id: number): boolean {
    return this.bibIds.value.includes(id);
  }

  toggleBib(id: number) {
    const ids: number[] = this.bibIds.value;

    //If bibIds form includes id, filter it out. If not, add it. 
    this.bibIds.setValue(
      ids.includes(id) ? ids.filter(e => e !== id) : [...ids, id]
    );
  }

  updateBibFilter(searchTerm: string) {

    this.filteredBibVms = this.bibVms.filter(bib =>
      bib.bibliographyEntry.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  mapToUi(sagaDate: SagaDate) {
    switch (sagaDate) {
      case (SagaDate._1250_1300): {
        return "1250-1300";
      }
      case (SagaDate._1300_1350): {
        return "1300-1350";
      }
      case (SagaDate._1350_1400): {
        return "1350-1400";
      }
      case (SagaDate._1400_1450): {
        return "1400-1450";
      }
      case (SagaDate._1450_1500): {
        return "1450-1500";
      }
      case (SagaDate._1500_1550): {
        return "1500-1550";
      }
      default: {
        return "Select a date:";
      }
    }
  }

  mapFromUi(sagaDate: string) {
    switch (sagaDate) {
      case ("1250-1300"): {
        return SagaDate._1250_1300;
      }
      case ("1300-1350"): {
        return SagaDate._1300_1350;
      }
      case ("1350-1400"): {
        return SagaDate._1350_1400;
      }
      case ("1400-1450"): {
        return SagaDate._1400_1450;
      }
      case ("1450-1500"): {
        return SagaDate._1450_1500;
      }
      case ("1500-1550"): {
        return SagaDate._1500_1550;
      }
      default: {
        return SagaDate.UNDEFINED;
      }
    }
  }

  fillInputFields() {
    this.editForm.patchValue({
      id: this.sagaEntry.id,
      title: this.sagaEntry.title,
      description: this.sagaEntry.description,
      translated: this.sagaEntry.translated,
      bibIds: [...this.sagaEntry.bibIds]
    });

    this.sagaVersionForms.clear();
    this.sagaEntry.sagaVersions.forEach(sagaVersion => {
      this.sagaVersionForms.push(this.createSagaVersionForm(sagaVersion));
    });

    this.populateMsForms();
  }

  resetValidators() {
    this.title.updateValueAndValidity();

    this.sagaVersionForms.controls.forEach(control => {
      control.get('title')?.updateValueAndValidity();
    })
  }

  //---------------
  //  USER CHOICE
  //---------------

  addSagaVersionForm() {
    this.sagaVersionForms.push(this.createSagaVersionForm());
  }

  removeSagaVersionForm(i: number) {
    this.sagaVersionForms.removeAt(i);
  }

  navigateToSagasAllPage() {
    this.closeAddEditModal();
    this.router.navigate([`sagas`]);
  }

  navigateToMotif(motifCode: string) {
    this.router.navigate([`motifs/${motifCode}`]);
  }

  addSaga() {
    this.mode = Mode.ADD;
    this.sagaEntry = this.initialiseSaga();
    this.showValidationErrors = false;
    this.addSagaVersionForm();
    this.openAddEditModal();
    this.hideAccordion();
  }

  editSaga() {
    this.mode = Mode.EDIT;
    this.showValidationErrors = false;
    this.fillInputFields();
    this.openAddEditModal();
    this.hideAccordion();
  }

  hideAccordion() {
    var accordions = document.getElementsByClassName('accordion-collapse');
    for (var element of accordions) {
      var accordionInstance = Collapse.getOrCreateInstance(element);
      if (accordionInstance != null) {
        console.log("ACCORDION HIDDEN");
        accordionInstance.hide();
      }
    }
  }

  submitAddOrEdit() {
    this.resetValidators();

    //If only one saga version under saga, set its title to the saga's title.
    if (this.sagaVersionForms.length == 1) {
      this.sagaVersionForms.at(0).get('title')?.setValue(this.title.value);
    }

    if (this.sagaVersionForms.length == 1) {
      this.sagaVersionForms.at(0).get('description')?.setValue('');
    }

    if (this.editForm.valid) {
      this.closeAddEditModal();

      if (this.mode === Mode.ADD) {
        this.postSaga();
      }
      else if (this.mode === Mode.EDIT) {
        this.updateSaga();
      }

    }
    else {
      this.showValidationErrors = true;
    }
  }

  deleteSaga() {
    this.closeDeleteModal();
    if (this.sagaEntry.id) {
      this.sagasService.deleteSaga(this.sagaEntry.id).subscribe({
        next: deletedSaga => {
          this.router.navigate([`sagas`]);
        }
      });
    }
  }

  //---------------
  //     CRUD
  //---------------

  //FILL VM
  formToVm() {
    this.sagaEntry.title = this.title.value;

    //Ugly fix until Quill releases update
    if (this.description.value == null) {
      this.sagaEntry.description = '';
    }
    else {
      this.sagaEntry.description = String(this.description.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
    }

    this.sagaEntry.translated = this.translated.value;

    this.sagaEntry.bibIds = [...this.bibIds.value];

    const msFormsRaw = this.msForms.getRawValue();
    this.sagaEntry.manuscripts = msFormsRaw
      .filter(ms => ms['selected'])
      .map(ms => ({
        msId: ms['msId'],
        shelfmark: ms['shelfmark'],
        folioNumber: ms['folioNumber']
      }));

    //Fill VM saga versions
    this.sagaVersions = [];

    for (var i = 0; i < this.sagaVersionForms.length; i++) {
      const sagaVersionForm = this.sagaVersionForms.controls[i];
      if (!sagaVersionForm) continue;

      const newSagaVersion = this.initialiseSagaVersion();
      this.sagaVersions.push(newSagaVersion);

      const sagaVersionFormId = sagaVersionForm.get('id');
      if (!sagaVersionFormId)
        this.sagaVersions[i].id = null;
      else
        this.sagaVersions[i].id = sagaVersionFormId.getRawValue();

      const sagaVersionFormTitle = sagaVersionForm.get('title');
      if (!sagaVersionFormTitle)
        this.sagaVersions[i].title = '';
      else
        this.sagaVersions[i].title = sagaVersionFormTitle.value;

      const sagaVersionFormDescription = sagaVersionForm.get('description');
      if (!sagaVersionFormDescription)
        this.sagaVersions[i].description = '';
      else
        this.sagaVersions[i].description = String(sagaVersionFormDescription.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');

      const sagaVersionFormDate = sagaVersionForm.get('date');
      if (!sagaVersionFormDate)
        this.sagaVersions[i].date = SagaDate.UNDEFINED;
      else
        this.sagaVersions[i].date = this.mapFromUi(sagaVersionFormDate.value);
    }

    this.sagaEntry.sagaVersions = this.sagaVersions;

  }

  getSagaTitles(){
    this.sagasService.getSagaTitles().subscribe({
      next: titles => {
        console.log(this.sagaTitles);
        this.sagaTitles = titles;
      },
      error: err => {}
    });
  }

  getBibs() {
    //Create sorted list of bibliography entry VMs
    this.bibService.getBibEntries().subscribe({
      next: bibEntries => {
        this.bibs = bibEntries;
        this.bibVms = [];
        this.bibs.forEach(bib => this.bibVms.push(this.bibMapper.mapDtoToVm(bib)));
        this.bibVms.sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));
        this.updateBibFilter('');
      }
    });
  }

  getManuscripts() {
    this.msService.getMsEntries().subscribe({
      next: msEntries => {
        this.manuscripts = msEntries.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
        this.sagaEntry.manuscripts.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));

        this.populateMsForms();
      },
      error: err => { }
    });
  }

  //READ
  getSaga() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id == null)
      return;
    //If saga id is valid, get saga
    this.sagasService.getSagaById(parseInt(id)).subscribe({
      next: receivedEntry => {
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedEntry);
        this.getSagaTitles();
        this.getBibs();
        this.getManuscripts();
      },
      error: err => console.log(err)
    });
  }


  //UPDATE
  updateSaga() {

    this.formToVm();

    this.sagasService.putSaga(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry)).subscribe({
      next: receivedSaga => {
        console.log("Saved successfully! " + receivedSaga);
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedSaga);
        this.sagaEntry.manuscripts.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

  //POST
  postSaga() {

    this.formToVm();

    console.log("Saga to be posted: ");
    console.log(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry));

    this.sagasService.postSaga(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry)).subscribe({
      next: receivedSaga => {
        console.log("Saved successfully! " + receivedSaga);
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedSaga);
      },
      error: err => {
        console.log("Problem with saving.");
      }
    });
  }

  //---------------
  // CUSTOM VALIDATION
  //---------------

  sagaTitleUnique(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim().toLowerCase();

      if (!value) {
        return null;
      }

      const duplicate = this.sagaTitles.find(saga =>
        saga.title.trim().toLowerCase() === value &&
        saga.id !== this.sagaEntry.id
      );

      return duplicate ? { sagaTitleNotUnique: true } : null;
    };
  }

  sagaVersionTitleUnique(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim().toLowerCase();

      if (!value) {
        return null;
      }

      //Checks whether the user has entered a title which is already assigned to a
      //DIFFERENT saga in the database
      const duplicateTitleInSaga = this.sagaEntry.sagaVersions.find(saga =>
        saga.title.trim().toLowerCase() === value &&
        saga.id !== control.parent?.get('id')?.value
      );

      //Checks whether the user has entered a title which is already assigned
      //to a saga within the form
      const trackingId =  control.parent?.get('trackingId')?.value;
      const duplicateTitleInForm = this.sagaVersionForms.controls.find(versionControl => {

        const versionControlTitle = String(versionControl.get('title')?.value ?? '').trim().toLowerCase();

        return versionControl.get('trackingId')?.value !== trackingId
        && versionControlTitle === value;
      }

      );

      return duplicateTitleInSaga || duplicateTitleInForm ? { sagaVersionTitleNotUnique: true } : null;
    };
  }

  dateNotSelected(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;

      console.log("date value: " + value);

      if (!value) {
        return null;
      }

      if (value === "Select a date:") {
        return { dateNotSelected: true };
      }
      else {
        return null;
      }
    }
  }
}
