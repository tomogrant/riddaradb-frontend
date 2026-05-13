import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Collapse, Modal } from 'bootstrap';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill'
import { IBib, PublicationType } from '../../bib/common/IBib';
import { BibService } from '../../bib/common/bib.service';
import { ISagaVm } from '../common/ISagaVm';
import { SagaService } from '../common/saga.service';
import { SagaMapper } from '../common/saga-mapper';
import { SagaDate } from '../common/SagaDate';
import { Mode } from '../../shared/Enums';
import { IBibVm } from '../../bib/common/IBibVm';
import { BibMapper } from '../../bib/common/bib-mapper';
import { ISagaVersionVm } from '../common/ISagaVersionVm';

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
    private bibMapper: BibMapper
  ) {}

    readonly PublicationType = PublicationType;
    readonly SagaDate = SagaDate;
    readonly Mode = Mode;
    mode: Mode = Mode.NONE;

    sagaEntry: ISagaVm = {
    id: 0,
    title: '',
    description: '',
    translated: false,
    sagaVersions: []
  };

  sagaVersions: ISagaVersionVm[] = [];

  activeSagaVersion: ISagaVersionVm = {
    id: 0,
    title: '',
    description: '',
    date: SagaDate.UNDEFINED,
    isTranslated: false,
    sagaId: 0,
    bibIds: [],
    primarySources: [],
    secondarySources: []
  };

  bibs: IBib[] = [];
  bibVms: IBibVm[] = [];
  filteredBibVms: IBibVm[] = [];

  showValidationErrors: boolean = false;

  editForm = new FormGroup({
    title: new FormControl('', [Validators.required, this.titleUnique(this.sagaVersions, this.activeSagaVersion.title)]),
    date: new FormControl('Select a date:', this.dateNotSelected()),
    description: new FormControl(''),
    isTranslated: new FormControl(false),
    bibFilter: new FormControl('', {nonNullable: true})
  });

  get title() {
  return this.editForm.get('title') as FormControl;
  }
  get description() {
  return this.editForm.get('description') as FormControl;
  }

  get date(){
    return this.editForm.get('date') as FormControl;
  }

  get bibFilter(){
    return this.editForm.get('bibFilter') as FormControl;
  }

  ngOnInit() {
    this.getSaga();

    this.bibFilter.valueChanges.pipe().subscribe({
      next: value => this.updateBibFilter(value)
    })
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  initialiseSagaVersion(): ISagaVersionVm{
    return {
    id: 0,
    title: '',
    description: '',
    date: SagaDate.UNDEFINED,
    isTranslated: false,
    sagaId: 0,
    bibIds: [],
    primarySources: [],
    secondarySources: []
    };
  }

  boxChecked(bib: IBibVm){
    if (this.activeSagaVersion.bibIds.includes(bib.id)){
      return true;
    }
    else{
      return false;
    }
  }

  addRemoveBibEntry(bib: IBibVm){

    if (this.activeSagaVersion.bibIds.includes(bib.id)){
      this.activeSagaVersion.bibIds.splice(this.activeSagaVersion.bibIds.indexOf(bib.id), 1);
    }
    else {
      this.activeSagaVersion.bibIds.push(bib.id);
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
    this.title.setValue(this.activeSagaVersion.title);
    this.description.setValue(this.activeSagaVersion.description);
    this.date.setValue(this.mapToUi(this.activeSagaVersion.date));
  }

  emptyInputFields(){
    this.title.setValue("");
    this.description.setValue("");
    this.date.setValue('Select a date:');

  }

  resetValidators(){
      this.title.clearValidators();
      this.title.addValidators([Validators.required, this.titleUnique(this.sagaVersions, this.activeSagaVersion.title)]);
      this.title.updateValueAndValidity();
    }

  //---------------
  //  USER CHOICE
  //---------------

  editSagaVersion(id: number){
    this.mode = Mode.EDIT;
    this.selectSagaVersion(id); 
    this.showValidationErrors = false;
    this.fillInputFields();
    this.updateBibFilter('');
    this.hideAccordion();
  }

  addSagaVersion(){
    this.mode = Mode.ADD;
    this.activeSagaVersion = this.initialiseSagaVersion();
    this.showValidationErrors = false;
    this.emptyInputFields();
    this.updateBibFilter('');
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

  selectSagaVersion(id: number){
    let sagaVersion = this.sagaVersions.find(i => i.id === id);
    if (typeof sagaVersion === 'undefined') {
      console.log("Saga not found");
      this.activeSagaVersion = this.initialiseSagaVersion();
    }
    else{
      this.activeSagaVersion = sagaVersion;
    }
  }

  submitAddOrEdit(){
    this.resetValidators();
    if (this.title.valid && this.date.valid){
      var editAddModal = document.getElementById('editAddSaga');
      if (editAddModal != null){
        var modal = Modal.getInstance(editAddModal);
        modal?.toggle();
      }

      if (this.mode === Mode.EDIT){
        this.updateSagaVersion();
      }
      if (this.mode === Mode.ADD){
        this.postSagaVersion();
      }
    }
    else{
      this.showValidationErrors = true;
    }
  }

  //---------------
  //     CRUD
  //---------------

  //FILL VM
  formToVm(){
    this.activeSagaVersion.sagaId = this.sagaEntry.id;
    this.activeSagaVersion.title = this.title.value;

    //Ugly fix until Quill releases update
    this.activeSagaVersion.description = String(this.description.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
    this.activeSagaVersion.date = this.mapFromUi(this.date.value);
  }

  //CREATE
  postSagaVersion(){
    this.formToVm();

    this.sagasService.postSagaVersion(this.sagaMapper.mapSagaVersionVmToRequestDto(this.activeSagaVersion)).subscribe({
      next: receivedSagaVersion => {
        console.log("saga version posted: " + receivedSagaVersion);
        this.getSaga();
      },
      error: err => console.log("Error with posting saga version: " + err)
    })
  }

  //READ
  getSaga(){
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        //If saga id is valid, get saga
        this.sagasService.getSagaById(id).subscribe({
          next: receivedEntry => {
            this.sagaEntry = receivedEntry;

            //Create sorted list of saga version VMs
            this.sagaVersions = [];
            this.sagaEntry.sagaVersions.forEach(version => this.sagaVersions.push(this.sagaMapper.mapSagaVersionResponseDtoToVm(version)));
            this.sagaVersions = this.sagaVersions.sort((a, b) => a.title.localeCompare(b.title));

            //Create sorted list of bibliography entry VMs
            this.bibService.getBibEntries().subscribe({
              next: bibEntries => {
                this.bibs = bibEntries;
                this.bibVms = [];
                this.bibs.forEach(bib => this.bibVms.push(this.bibMapper.mapDtoToVm(bib)));
                this.bibVms.sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));
              }
            })
          },
          error: err => console.log(err)
        });
      }
    });
  }

  //UPDATE
  updateSagaVersion(){
    
    this.formToVm();

    this.sagasService.putSagaVersion(this.sagaMapper.mapSagaVersionVmToRequestDto(this.activeSagaVersion)).subscribe({
      next: receivedSagaVersion => {
        console.log("Saved successfully! " + receivedSagaVersion);
        this.getSaga();
      },
      error: err => {
        console.log("Problem with saving.");
      }
    })
  }

  //DELETE
  deleteSagaVersion(){
  this.sagasService.deleteSagaVersion(this.activeSagaVersion.id).subscribe({
    next: sagaVersion => this.getSaga(),
    error: err=> console.log("problem with deleting")
    })
  }


  //---------------
  // CUSTOM VALIDATION
  //---------------


  titleUnique(sagas: ISagaVersionVm[], sagaName: string): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

      let saga = sagas.find(saga => saga.title.toLowerCase() === value.toLowerCase());
      if (typeof saga === 'undefined') {
        return null;
      }
      else if(value !== sagaName){
        return { nameNotUnique: true };
      }
      else{
        return null;
      }
    }
  }

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
