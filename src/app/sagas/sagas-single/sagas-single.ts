import { FormGroup, FormControl, FormArray, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Collapse, Modal } from 'bootstrap';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill'
import { IBib, PublicationType } from '../../bib/common/IBib';
import { BibService } from '../../bib/common/bib.service';
import { SagaService } from '../common/saga.service';
import { SagaMapper } from '../common/saga-mapper';
import { SagaDate } from '../common/SagaDate';
import { Mode } from '../../shared/Enums';
import { IBibVm } from '../../bib/common/IBibVm';
import { BibMapper } from '../../bib/common/bib-mapper';
import { ISagaVersionVm } from '../common/ISagaVersionVm';
import { IMotif } from '../../motifs/common/IMotif';
import { ISagaVm } from '../common/ISagaVm';
import { NonNullAssert } from '@angular/compiler';

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
    private sagaMapper: SagaMapper,
    private bibMapper: BibMapper,
    private router: Router
  ) {}

    readonly PublicationType = PublicationType;
    readonly SagaDate = SagaDate;
    readonly Mode = Mode;
    mode: Mode = Mode.NONE;

  sagaEntry: ISagaVm = this.initialiseSaga();

  sagaVersions: ISagaVersionVm[] = [];

  trackingId: number = 0;

  bibs: IBib[] = [];
  bibVms: IBibVm[] = [];
  filteredBibVms: IBibVm[] = [];

  motifs: IMotif[] = [];

  showValidationErrors: boolean = false;

  editForm = new FormGroup({
    id: new FormControl<number | null>({value: null, disabled: true}),
    title: new FormControl<string>(''),
    translated: new FormControl<boolean>(false),
    description: new FormControl<string>(''),
    sagaVersionForms: new FormArray<FormGroup>([]),
    bibFilter: new FormControl<string>('')
  });

  createSagaVersionForm(){
    return new FormGroup({
      trackingId: new FormControl<number>(this.trackingId++, {nonNullable: true}),
      id: new FormControl<number | null>({value: null, disabled: true}),
      title: new FormControl<string>('', {nonNullable: true, validators: Validators.required} ),
      date: new FormControl<string>('Select a date:', { nonNullable: true, validators: this.dateNotSelected() }),
      description: new FormControl<string>(''),
    });
  }

  get title() {
  return this.editForm.get('title') as FormControl;
  }

  get translated(){
    return this.editForm.get('translated') as FormControl;
  }

  get description() {
    return this.editForm.get('description') as FormControl;
  }

  get sagaVersionForms(){
    return this.editForm.get('sagaVersionForms') as FormArray;
  }

  get bibFilter(){
    return this.editForm.get('bibFilter') as FormControl;
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      //ADD MODE
      if (params.get('mode') == 'add'){
        this.addSaga();
        this.getBibs();
      }
      else{
        this.getSaga();
      }
    });

    this.bibFilter.valueChanges.pipe().subscribe({
      next: value => this.updateBibFilter(value)
    });
  }

  //---------------
  //  FIELD LOGIC
  //---------------

    openAddModal(){
    var editModal = document.getElementById('editSaga');
    if (editModal != null){
      var modal = Modal.getOrCreateInstance(editModal);
      if (modal != null){
        modal.toggle();
      }
    }
  }

  initialiseSaga(): ISagaVm{
    return {
    id: null,
    title: '',
    description: '',
    translated: false,
    sagaVersions: [],
    bibIds: [],
    primarySources: [],
    secondarySources: []
    };
  }

  initialiseSagaVersion(): ISagaVersionVm{
    return {
    id: null,
    title: '',
    description: '',
    date: SagaDate.UNDEFINED,
    sagaId: 0,
    sagaMotifs: []
    };
  }

  boxChecked(bib: IBibVm){
    if (this.sagaEntry.bibIds.includes(bib.id)){
      return true;
    }
    else{
      return false;
    }
  }

  addRemoveBibEntry(bib: IBibVm){

    if (this.sagaEntry.bibIds.includes(bib.id)){
      this.sagaEntry.bibIds.splice(this.sagaEntry.bibIds.indexOf(bib.id), 1);
    }
    else {
      this.sagaEntry.bibIds.push(bib.id);
    }
  }

  updateBibFilter(searchTerm: string){

    this.filteredBibVms = this.bibVms.filter(bib =>
      bib.bibliographyEntry.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  mapToUi(sagaDate: SagaDate){
    switch(sagaDate){
      case(SagaDate._1250_1300):{
        return "1250-1300";
      }
      case(SagaDate._1300_1350):{
        return "1300-1350";
      }
      case(SagaDate._1350_1400):{
        return "1350-1400";
      }
      case(SagaDate._1400_1450):{
        return "1400-1450";
      }
      case(SagaDate._1450_1500):{
        return "1450-1500";
      }
      case(SagaDate._1500_1550):{
        return "1500-1550";
      }
      default:{
        return "Select a date:";
      }
    }
  }

  mapFromUi(sagaDate: string){
    switch(sagaDate){
      case("1250-1300"):{
        return SagaDate._1250_1300;
      }
      case("1300-1350"):{
        return SagaDate._1300_1350;
      }
      case("1350-1400"):{
        return SagaDate._1350_1400;
      }
      case("1400-1450"):{
        return SagaDate._1400_1450;
      }
      case("1450-1500"):{
        return SagaDate._1450_1500;
      }
      case("1500-1550"):{
        return SagaDate._1500_1550;
      }
      default:{
        return SagaDate.UNDEFINED;
      }
    }
  }

  fillInputFields(){
    this.editForm.patchValue({
      id: this.sagaEntry.id,
      title: this.sagaEntry.title,
      description: this.sagaEntry.description,
      translated: this.sagaEntry.translated,
    });

    this.sagaVersionForms.clear();

    for (let i = 0; i < this.sagaEntry.sagaVersions.length; i++){
      const form = this.createSagaVersionForm();

      form.setValue({
        trackingId: this.trackingId++,
        id: this.sagaEntry.sagaVersions[i].id,
        title: this.sagaEntry.sagaVersions[i].title,
        date: this.mapToUi(this.sagaEntry.sagaVersions[i].date),
        description: this.sagaEntry.sagaVersions[i].description
      });

      this.sagaVersionForms.push(form);
    }
  }

  emptyInputFields(){
    this.title.reset();
    this.description.reset();
    this.translated.reset();
    this.sagaVersionForms.clear();
  }

  resetValidators(){
      this.title.clearValidators();
      this.title.addValidators(Validators.required);
      this.title.updateValueAndValidity();
    }

  //---------------
  //  USER CHOICE
  //---------------

  addSagaVersionForm(){
      this.sagaVersionForms.push(this.createSagaVersionForm());
  }

  removeSagaVersionForm(i: number){
    this.sagaVersionForms.removeAt(i);
  }

  navigateToMotif(motifCode: string){
    this.router.navigate([`motifs/${motifCode}`]);
  }

  addSaga(){
    this.mode = Mode.ADD;
    this.sagaEntry = this.initialiseSaga();
    this.showValidationErrors = false;
    this.addSagaVersionForm();
    this.openAddModal();
    this.hideAccordion();
  }

  editSaga(){
    this.mode = Mode.EDIT;
    this.showValidationErrors = false;
    this.fillInputFields();
    this.hideAccordion();
  }

  hideAccordion(){
    var accordions = document.getElementsByClassName('accordion-collapse');
    for (var element of accordions){
      var accordionInstance = Collapse.getOrCreateInstance(element);
      if (accordionInstance != null){
        accordionInstance.hide();
      }
    }
  }

  submitAddOrEdit(){
    this.resetValidators();

    //If only one saga version under saga, set its title to the saga's title.
    if (this.sagaVersionForms.length == 1){
      this.sagaVersionForms.at(0).get('title')?.setValue(this.title.value);
    }

    if (this.sagaVersionForms.length == 1){
      this.sagaVersionForms.at(0).get('description')?.setValue('');
    }

    if (this.editForm.valid){
      var editModal = document.getElementById('editSaga');
      if (editModal != null){
        var modal = Modal.getInstance(editModal);
        modal?.toggle();
      }

      if (this.mode === Mode.ADD)
        this.postSaga();
      else if (this.mode === Mode.EDIT){
        this.updateSaga();
      }

    }
    else{
      this.showValidationErrors = true;
    }
  }

  deleteSaga(){
    if (this.sagaEntry.id){
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
  formToVm(){
    this.sagaEntry.title = this.title.value;

    //Ugly fix until Quill releases update
    if (this.description.value == null){
      this.sagaEntry.description = '';
    }
    else {
      this.sagaEntry.description = String(this.description.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
    }

    this.sagaEntry.translated = this.translated.value;

    this.sagaVersions = [];

    for (var i = 0; i < this.sagaVersionForms.length; i++){
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

  getBibs(){
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

  //READ
  getSaga(){
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        //If saga id is valid, get saga
        this.sagasService.getSagaById(id).subscribe({
          next: receivedEntry => {
            this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedEntry);
            this.getBibs();
          },
          error: err => console.log(err)
        });
      }
    });
  }

  //UPDATE
  updateSaga(){

    this.formToVm();

    console.log("Saga to be updated: ");
    console.log(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry));

    this.sagasService.putSaga(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry)).subscribe({
      next: receivedSaga => {
        console.log("Saved successfully! " + receivedSaga);
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedSaga);
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

    //UPDATE
  postSaga(){

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
    })
  }

  //---------------
  // CUSTOM VALIDATION
  //---------------


  // titleUnique(sagas: ISagaVersionVm[]): ValidatorFn {
  //   return (control:AbstractControl) : ValidationErrors | null => {

  //       const value = control.value;

  //       if (!value) {
  //           return null;
  //       }

  //     let saga = sagas.find(saga => saga.title.toLowerCase() === value.toLowerCase());
  //     if (typeof saga === 'undefined') {
  //       return null;
  //     }
  //     else if(value !== saga.title){
  //       return { nameNotUnique: true };
  //     }
  //     else{
  //       return null;
  //     }
  //   }
  // }

  dateNotSelected(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      console.log("date value: " + value);

      if (!value) {
          return null;
      }

      if (value === "Select a date:"){
        return { dateNotSelected: true };
      }
      else{
        return null;
      }
    }
  }
}
