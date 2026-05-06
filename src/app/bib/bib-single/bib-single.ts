import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { Mode } from '../../shared/Enums';
import { BibService } from '../bib.service';
import { IBib, PublicationType } from '../IBib';
import { editFormConfigs, EditFormConfig } from '../bib-config';
import { ISagaVm } from '../../sagas/common/ISagaVm';
import { SagaService } from '../../sagas/common/saga.service';
import { ISagaVersionDto } from '../../sagas/common/ISagaVersionDto';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bibs',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, QuillModule],
  templateUrl: './bib-single.html',
  providers: [BibService]
})
export class BibSingle {
  constructor(private bibService: BibService, 
              private sagaService: SagaService,
              private route: ActivatedRoute,
              private router: Router) {}

  pageTitle = 'Bibliography entry';

  urlPattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

  editionsTranslations: IBib[] = [];
  secondary: IBib[] = [];
  other: IBib[] = [];

  publicationTypesUi: string[] = [];

  readonly PublicationType = PublicationType;
  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  initialisedBib: IBib = {
    id: 0,
    publicationType: PublicationType.UNDEFINED,
    authors: "",
    editors: "",
    translators: "",
    title: "",
    url: "",
    bookEditors: "",
    book: "",
    bookSeries: "",
    volume: "",
    numOfVolumes: "",
    placeOfPublication: "",
    publisher: "",
    publicationYear: "",
    pageNumbers: "",
    sagaVersionIds: [],
    recommended: false,
    description: ""
  }

  activeBib: IBib = this.initialisedBib;

  editForm = new FormGroup({
    type: new FormControl('Select publication type:', {nonNullable: true}),
    authors: new FormControl('', {nonNullable: true}),
    editors: new FormControl('', {nonNullable: true}),
    translators: new FormControl('', {nonNullable: true}),
    title: new FormControl('', {nonNullable: true}),
    url: new FormControl('', {nonNullable: true}),
    bookEditors: new FormControl('', {nonNullable: true}),
    book: new FormControl('', {nonNullable: true}),
    bookSeries: new FormControl('', {nonNullable: true}),
    volume: new FormControl('', {nonNullable: true}),
    numOfVolumes: new FormControl('', {nonNullable: true}),
    placeOfPublication: new FormControl('', {nonNullable: true}),
    publisher: new FormControl('', {nonNullable: true}),
    publicationYear: new FormControl('', {nonNullable: true}),
    pageNumbers: new FormControl('', {nonNullable: true}),
    recommended: new FormControl(false, {nonNullable: true}),
    description: new FormControl('', {nonNullable: true}),
  }, [this.authorsEditorsTranslatorsNotProvided()]);

  showValidationErrors: boolean = false;

  //CONFIG RECORDS FOR EDITFORM
  editFormConfig = {
    includeAuthors: false,
    includeEditors: false,
    includeTranslators: false,
    includeTitle: false,
    includeUrl: false,
    includeBookEditors: false,
    includeBook: false,
    includeBookSeries: false,
    includeVolume: false,
    includeNumOfVolumes: false,
    includePlaceOfPublication: false,
    includePublisher: false,
    includePublicationYear: false,
    includePageNumbers: false,
    includeRecommended: false,
    includeDescription: false,

    requireAuthorsEditorsTranslators: false,
    requireAuthors: false,
    requireEditors: false,
    requireTranslators: false,
    requireTitle: false,
    requireUrl: false,
    requireBookEditors: false,
    requireBook: false,
    requirePlaceOfPublication: false,
    requirePublisher: false,
    requirePublicationYear: false,
    requirePageNumbers: false
  }

  //GETTERS FOR EDITFORM
  get type() {
    return this.editForm.get('type') as FormControl;
  }
  get authors() {
    return this.editForm.get('authors') as FormControl;
  }
  get editors() {
    return this.editForm.get('editors') as FormControl;
  }
  get translators() {
    return this.editForm.get('translators') as FormControl;
  }
  get title(){
    return this.editForm.get('title') as FormControl;
  }
  get url(){
    return this.editForm.get('url') as FormControl;
  }
  get bookEditors() {
    return this.editForm.get('bookEditors') as FormControl;
  }
  get book() {
    return this.editForm.get('book') as FormControl;
  }
  get bookSeries() {
    return this.editForm.get('bookSeries') as FormControl;
  }
  get volume() {
    return this.editForm.get('volume') as FormControl;
  }
  get numOfVolumes() {
    return this.editForm.get('numOfVolumes') as FormControl;
  }
  get placeOfPublication() {
    return this.editForm.get('placeOfPublication') as FormControl;
  }
  get publisher(){
    return this.editForm.get('publisher') as FormControl;
  }
  get publicationYear(){
    return this.editForm.get('publicationYear') as FormControl;
  }
  get pageNumbers(){
    return this.editForm.get('pageNumbers') as FormControl;
  }
  get recommended(){
    return this.editForm.get('recommended') as FormControl;
  }
  get description(){
    return this.editForm.get('description') as FormControl;
  }

  ngOnInit() {
    this.initialiseFormAndValidators();
    this.parseParams();
  }

  parseParams(){
    this.route.paramMap.subscribe(params => {
      //ADD MODE
      if (params.get('mode') == 'add'){
        this.addBib();
      }
      else {
        //READ
        const id = Number(params.get('id'));
        if (!Number.isNaN(id)) {
          this.bibService.getBibEntryById(id).subscribe(receivedEntry => {
            this.activeBib = receivedEntry;
          });
        }
      }
    });
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  initialiseFormAndValidators(){
    //Populate array with strings from backend enum
    for (let publicationType of Object.values(PublicationType)){
      this.publicationTypesUi.push(this.convertEnumToUi(publicationType));
    }
    //Remove 'undefined' entry
    this.publicationTypesUi.shift();

    this.type.valueChanges.pipe().subscribe({
      next: publicationType => {
        console.log("Value changed");
        //Set up config and validation for chosen publication type
        this.setConfig(this.convertUiToEnum(publicationType));
        this.setUpValidation();
      }
    })
  }

  setConfig(publicationType: PublicationType){
        switch(publicationType){
      case(PublicationType.UNDEFINED):
        this.editFormConfig = editFormConfigs[PublicationType.UNDEFINED];
        break;
      case(PublicationType.JOURNAL_ARTICLE):
        this.editFormConfig = editFormConfigs[PublicationType.JOURNAL_ARTICLE];
        break;
      case(PublicationType.BOOK_CHAPTER):
        this.editFormConfig = editFormConfigs[PublicationType.BOOK_CHAPTER];
        break;
      case(PublicationType.EDITION):
        this.editFormConfig = editFormConfigs[PublicationType.EDITION];
        break;
      case(PublicationType.TRANSLATION):
        this.editFormConfig = editFormConfigs[PublicationType.TRANSLATION];
        break;
      case(PublicationType.MONOGRAPH):
        this.editFormConfig = editFormConfigs[PublicationType.MONOGRAPH];
        break;
      case(PublicationType.EDITED_COLLECTION):
        this.editFormConfig = editFormConfigs[PublicationType.EDITED_COLLECTION];
        break;
      case(PublicationType.THESIS):
        this.editFormConfig = editFormConfigs[PublicationType.THESIS];
        break;
      case(PublicationType.WEBSITE):
        this.editFormConfig = editFormConfigs[PublicationType.WEBSITE];
        break;
      case(PublicationType.OTHER):
        this.editFormConfig = editFormConfigs[PublicationType.OTHER];
        break;
      default:
        console.log("Error in validation setup!");
    }
  }

  setUpValidation(){

    this.showValidationErrors = false;

    //Optional validators
    if (this.editFormConfig.includeUrl) {this.url.addValidators(Validators.pattern(this.urlPattern));}
    else {this.url.removeValidators(Validators.pattern(this.urlPattern));}

    if (this.editFormConfig.includeVolume) {this.volume.addValidators(this.numericError());}
    else {this.volume.removeValidators(this.numericError());}

    if (this.editFormConfig.includeNumOfVolumes) {this.numOfVolumes.addValidators(this.numericError());}
    else {this.numOfVolumes.removeValidators(this.numericError());}

    if (this.editFormConfig.includePageNumbers){this.pageNumbers.addValidators(this.pageNumError());}
    else {this.pageNumbers.removeValidators(this.pageNumError());}

    if (this.editFormConfig.includePublicationYear){this.publicationYear.addValidators(Validators.pattern('[0-9]{4}'));}
    else {this.publicationYear.removeValidators(Validators.pattern('[0-9]{4}'));}

    //Required validators
    if (this.editFormConfig.requireAuthorsEditorsTranslators){this.editForm.addValidators(this.authorsEditorsTranslatorsNotProvided());}
    else {this.editForm.removeValidators(this.authorsEditorsTranslatorsNotProvided());}

    if (this.editFormConfig.requireAuthors){this.authors.addValidators(Validators.required);}
    else (this.authors.removeValidators(Validators.required));

    if (this.editFormConfig.requireEditors){this.editors.addValidators(Validators.required);}
    else {(this.editors.removeValidators(Validators.required))};

    if (this.editFormConfig.requireTranslators){this.translators.addValidators(Validators.required);}
    else {this.translators.removeValidators(Validators.required);}

    if (this.editFormConfig.requireTitle){this.title.addValidators(Validators.required);}
    else{this.title.removeValidators(Validators.required);}

    if (this.editFormConfig.requireUrl){this.url.addValidators(Validators.required);}
    else {this.url.removeValidators(Validators.required);}

    if (this.editFormConfig.requireBookEditors){this.bookEditors.addValidators(Validators.required);}
    else {this.bookEditors.removeValidators(Validators.required);}

    if (this.editFormConfig.requireBook){this.book.addValidators(Validators.required);}
    else {this.book.removeValidators(Validators.required);}

    if (this.editFormConfig.requirePlaceOfPublication){this.placeOfPublication.addValidators(Validators.required)}
    else {this.placeOfPublication.removeValidators(Validators.required);}

    if (this.editFormConfig.requirePublisher){this.publisher.addValidators(Validators.required);}
    else {this.publisher.removeValidators(Validators.required);}

    if (this.editFormConfig.requirePublicationYear){this.publicationYear.addValidators(Validators.required);}
    else {this.publicationYear.removeValidators(Validators.required);}

    if (this.editFormConfig.requirePageNumbers){this.pageNumbers.addValidators(Validators.required);}
    else {this.pageNumbers.removeValidators(Validators.required);}

    this.editForm.updateValueAndValidity();
  }

  convertEnumToUi(publicationType: PublicationType){
    return(String(publicationType).charAt(0) + String(publicationType.slice(1).toLowerCase())).replace('_', ' ');
  }

  convertUiToEnum(publicationType: string){
    return publicationType.toUpperCase().replace(' ', '_') as PublicationType;
  }

  //---------------
  //  USER CHOICE
  //---------------

  addBib(){
    this.mode = Mode.ADD;

    this.initialiseFormAndValidators();
    this.activeBib = this.initialisedBib;
    this.openAddModal();
  }

  editBib(){
    this.mode = Mode.EDIT;

    //Shouldn't be possible
    if (this.activeBib.publicationType === PublicationType.UNDEFINED){
      this.type.reset();
    }
    else {
      this.type.setValue(this.convertEnumToUi(this.activeBib.publicationType));
    }

    this.fillForm();
  }

  deleteBib(){

  }

  openAddModal(){
    var editAddModal = document.getElementById('editAddBib');
    if (editAddModal != null){
      var modal = Modal.getOrCreateInstance(editAddModal);
      if (modal != null){
        modal.toggle();
      }
    }
  }

  submitAddOrEdit(){

    Object.values(this.editForm.controls).forEach(formControl =>{
      formControl.updateValueAndValidity();
    });

    if (this.editForm.valid){
      var editAddModal = document.getElementById('editAddBib');
      if (editAddModal != null){
        var modal = Modal.getInstance(editAddModal);
        modal?.toggle();
      }

      if (this.mode === Mode.ADD){
        this.postBib();
      }

      if (this.mode === Mode.EDIT){
        this.updateBib();
      }
    }
    else{
      this.showValidationErrors = true;
    }
  }

  fillForm(){
    if (this.editFormConfig.includeAuthors){this.authors.setValue(this.activeBib.authors);}
    else {this.authors.reset();}

    if (this.editFormConfig.includeEditors){this.editors.setValue(this.activeBib.editors);}
    else {this.editors.reset();}

    if (this.editFormConfig.includeTranslators){this.translators.setValue(this.activeBib.translators);}
    else {this.translators.reset();}

    if (this.editFormConfig.includeTitle){this.title.setValue(this.activeBib.title);}
    else {this.title.reset();}

    if (this.editFormConfig.includeUrl){this.url.setValue(this.activeBib.url);}
    else {this.url.reset();}

    if (this.editFormConfig.includeBookEditors){this.bookEditors.setValue(this.activeBib.bookEditors);}
    else {this.bookEditors.reset();}

    if (this.editFormConfig.includeBook){this.book.setValue(this.activeBib.book);}
    else {this.book.reset();}

    if (this.editFormConfig.includeBookSeries){this.bookSeries.setValue(this.activeBib.bookSeries);}
    else {this.bookSeries.reset();}

    if (this.editFormConfig.includeVolume){this.volume.setValue(this.activeBib.volume);}
    else {this.volume.reset();}

    if (this.editFormConfig.includeNumOfVolumes){this.numOfVolumes.setValue(this.activeBib.numOfVolumes);}
    else {this.numOfVolumes.reset();}

    if (this.editFormConfig.includePlaceOfPublication){this.placeOfPublication.setValue(this.activeBib.placeOfPublication);}
    else {this.placeOfPublication.reset();}

    if (this.editFormConfig.includePublisher){this.publisher.setValue(this.activeBib.publisher);}
    else {this.publisher.reset();}

    if (this.editFormConfig.includePublicationYear){this.publicationYear.setValue(this.activeBib.publicationYear);}
    else {this.publicationYear.reset();}

    if (this.editFormConfig.includePageNumbers){this.pageNumbers.setValue(this.activeBib.pageNumbers);}
    else {this.pageNumbers.reset();}

    if (this.editFormConfig.includeRecommended){this.recommended.setValue(this.activeBib.recommended);}
    else {this.recommended.reset();}

        if (this.editFormConfig.includeDescription){this.description.setValue(this.activeBib.description);}
    else {this.description.reset();}

  }

  fillBibDto(){
    this.activeBib.publicationType = this.convertUiToEnum(this.type.value);

    if (this.editFormConfig.includeAuthors) this.activeBib.authors = this.authors.value;
    else (this.activeBib.authors = this.authors.defaultValue);
    
    if (this.editFormConfig.includeEditors) this.activeBib.editors = this.editors.value;
    else (this.activeBib.editors = this.editors.defaultValue);

    if (this.editFormConfig.includeTranslators) this.activeBib.translators = this.translators.value;
    else (this.activeBib.translators = this.translators.defaultValue);

    if (this.editFormConfig.includeTitle) this.activeBib.title = this.title.value;
    else (this.activeBib.title = this.title.defaultValue);

    if (this.editFormConfig.includeUrl) this.activeBib.url = this.url.value;
    else (this.activeBib.url = this.url.defaultValue);

    if (this.editFormConfig.includeBookEditors) this.activeBib.bookEditors = this.bookEditors.value;
    else (this.activeBib.bookEditors = this.bookEditors.defaultValue);

    if (this.editFormConfig.includeBook) this.activeBib.book = this.book.value;
    else (this.activeBib.book = this.book.defaultValue);

    if (this.editFormConfig.includeBookSeries) this.activeBib.bookSeries = this.bookSeries.value;
    else (this.activeBib.bookSeries = this.bookSeries.defaultValue);

    if (this.editFormConfig.includeVolume) this.activeBib.volume = this.volume.value;
    else (this.activeBib.volume = this.volume.defaultValue);

    if (this.editFormConfig.includeNumOfVolumes) this.activeBib.numOfVolumes = this.numOfVolumes.value;
    else (this.activeBib.numOfVolumes = this.numOfVolumes.defaultValue);

    if (this.editFormConfig.includePlaceOfPublication) this.activeBib.placeOfPublication = this.placeOfPublication.value;
    else (this.activeBib.placeOfPublication = this.placeOfPublication.defaultValue);

    if (this.editFormConfig.includePublisher) this.activeBib.publisher = this.publisher.value;
    else (this.activeBib.publisher = this.publisher.defaultValue);

    if (this.editFormConfig.includePublicationYear) this.activeBib.publicationYear = this.publicationYear.value;
    else (this.activeBib.publicationYear = this.publicationYear.defaultValue);

    if (this.editFormConfig.includePageNumbers) this.activeBib.pageNumbers = this.pageNumbers.value;
    else (this.activeBib.pageNumbers = this.pageNumbers.defaultValue);

    if (this.editFormConfig.includeRecommended) this.activeBib.recommended = this.recommended.value;
    else (this.activeBib.recommended = this.recommended.defaultValue);

    if (this.editFormConfig.includeDescription) this.activeBib.description = this.description.value;
    else (this.activeBib.description = this.description.defaultValue);
  }

  navigateToBibEntryPage(id: number){
    this.router.navigate([`bib/${id}`]);
  }

  navigateToBibAllPage(){
    this.router.navigate([`bib`]);
  }

  stringToInt(string: string){
    return Number(parseInt(string));
  }

  //---------------
  //  CUSTOM VALIDATION
  //---------------

  authorsEditorsTranslatorsNotProvided(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    const value = control.value;

    if (value.authors.trim() !== "" ||
        value.editors.trim() !== "" ||
        value.translators.trim() !== ""
    ) {
      return null;
    }
    else{
      return { authorsEditorsTranslatorsNotProvided: true }
    }
  }
}

  numericError(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    const value = control.value;

    if (value !== ''){
      if (isNaN(value) || value < 1){
        console.log("Entry invalid!")
        return { numericError: true }
      }
      else{
        return null;
      }
    }
    else{
      return null;
    }
  }
}

  pageNumError(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    const value = control.value;
    const pageRangePattern = /[0-9]-[0-9]/;

    if (value !== ''){
      if (pageRangePattern.test(value)){
        return null;
      }
      else if (isNaN(value) || value < 1){
        return { pageNumError: true }
      }
      else{
        return null;
      }
    }
    else{
      return null;
    }
  }
}

  //---------------
  //  CRUD
  //---------------

  //CREATE
  postBib(){
    this.fillBibDto();
    this.bibService.postBib(this.activeBib).subscribe({
      next: receivedBib => {
        console.log("bib posted: " + receivedBib);
        this.navigateToBibEntryPage(receivedBib.id);
      },
      error: err => console.log("Error with posting bib entry: " + err)
    })
  }
  
  //UPDATE
  updateBib(){
    this.fillBibDto();
    this.bibService.putBib(this.activeBib).subscribe({
      next: receivedBib =>{
        console.log("bibliography entry updated: " + receivedBib);
        this.parseParams();
      },
      error: err => {
        console.log('Error updating bib: ' + err)
      }
    })
  }
}
