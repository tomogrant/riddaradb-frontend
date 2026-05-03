import { FormGroup, FormControl, AbstractControl, 
        ValidationErrors, ReactiveFormsModule, Validators,
        ValidatorFn } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { Mode } from '../../shared/Enums';
import { BibService } from '../bib.service';
import { IBib, PublicationType } from '../IBib';
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

  pageTitle = 'Bibliography entries';
  bibs: IBib[] = [];

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
    recommended: false
  }

  activeBib: IBib = this.initialisedBib;

  editForm = new FormGroup({
    type: new FormControl('Select publication type:', {nonNullable: true}),
    authors: new FormControl(''),
    editors: new FormControl(''),
    translators: new FormControl(''),
    title: new FormControl(''),
    url: new FormControl(''),
    bookEditors: new FormControl(''),
    book: new FormControl(''),
    bookSeries: new FormControl(''),
    volume: new FormControl(''),
    numOfVolumes: new FormControl(''),
    placeOfPublication: new FormControl(''),
    publisher: new FormControl(''),
    publicationYear: new FormControl(''),
    pageNumbers: new FormControl(''),
    description: new FormControl(''),
    recommended: new FormControl(false)
  }, [this.authorsEditorsTranslatorsNotProvided()]);

  showValidationErrors: boolean = false;

  //CONFIG RECORDS FOR EDITFORM
  editFormConfig = {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: false,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: false,
    validatePublisher: false,
    validatePublicationYear: false,
    validatePageNumbers: false
  }

  editFormConfigs: Record<PublicationType, {
    validateAuthorsEditorsTranslators: boolean;
    validateAuthors: boolean;
    validateEditors: boolean;
    validateTranslators: boolean;
    validateTitle: boolean;
    validateUrl: boolean;
    validateBookEditors: boolean;
    validateBook: boolean;
    validatePlaceOfPublication: boolean;
    validatePublisher: boolean;
    validatePublicationYear: boolean;
    validatePageNumbers: boolean;
  }> = {
    [PublicationType.UNDEFINED]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: false,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: false,
    validatePublisher: false,
    validatePublicationYear: false,
    validatePageNumbers: false
    },
    [PublicationType.JOURNAL_ARTICLE]: {
    validateAuthorsEditorsTranslators: true,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: true,
    validatePlaceOfPublication: false,
    validatePublisher: false,
    validatePublicationYear: true,
    validatePageNumbers: true
    },
    [PublicationType.BOOK_CHAPTER]: {
    validateAuthorsEditorsTranslators: true,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: true,
    validateBook: true,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: true
    },
    [PublicationType.EDITION]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: true,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: true,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: false
    },
    [PublicationType.TRANSLATION]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: true,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: false
    },
    [PublicationType.MONOGRAPH]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: true,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: false
    },
    [PublicationType.EDITED_COLLECTION]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: true,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: false
    },
    [PublicationType.THESIS]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: true,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: true,
    validatePublisher: true,
    validatePublicationYear: true,
    validatePageNumbers: false
    },
    [PublicationType.WEBSITE]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: true,
    validateUrl: true,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: false,
    validatePublisher: false,
    validatePublicationYear: false,
    validatePageNumbers: false
    },
    [PublicationType.OTHER]: {
    validateAuthorsEditorsTranslators: false,
    validateAuthors: false,
    validateEditors: false,
    validateTranslators: false,
    validateTitle: false,
    validateUrl: false,
    validateBookEditors: false,
    validateBook: false,
    validatePlaceOfPublication: false,
    validatePublisher: false,
    validatePublicationYear: false,
    validatePageNumbers: false
    }
  };

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
  get description(){
    return this.editForm.get('description') as FormControl;
  }
  get recommended(){
    return this.editForm.get('recommended') as FormControl;
  }

  ngOnInit() {
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
            this.initialiseFormAndValidators();
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

    this.sortBibEntries();

    this.type.valueChanges.pipe().subscribe({
      next: publicationType => {
        console.log(publicationType);
        this.setUpValidation(this.convertUiToEnum(publicationType));
      }
    })
  }

  sortBibEntries(){
    for (let bib of this.bibs){
      switch(bib.publicationType){
        case (PublicationType.EDITION):
        case (PublicationType.TRANSLATION):
          this.editionsTranslations.push(bib);
          break;
        case (PublicationType.OTHER):
          this.other.push(bib);
          break;
        case (PublicationType.UNDEFINED):
          console.log("Bibliography entry " + bib.authors + ", " + bib.title + " is undefined!");
          break;
        default:
          this.secondary.push(bib);
          break;
      }
    }
  }

  setUpValidation(publicationType: PublicationType){

    switch(publicationType){
      case(PublicationType.UNDEFINED):
        this.editFormConfig = this.editFormConfigs[PublicationType.UNDEFINED];
        break;
      case(PublicationType.JOURNAL_ARTICLE):
        this.editFormConfig = this.editFormConfigs[PublicationType.JOURNAL_ARTICLE];
        break;
      case(PublicationType.BOOK_CHAPTER):
        this.editFormConfig = this.editFormConfigs[PublicationType.BOOK_CHAPTER];
        break;
      case(PublicationType.EDITION):
        this.editFormConfig = this.editFormConfigs[PublicationType.EDITION];
        break;
      case(PublicationType.TRANSLATION):
        this.editFormConfig = this.editFormConfigs[PublicationType.TRANSLATION];
        break;
      case(PublicationType.MONOGRAPH):
        this.editFormConfig = this.editFormConfigs[PublicationType.MONOGRAPH];
        break;
      case(PublicationType.EDITED_COLLECTION):
        this.editFormConfig = this.editFormConfigs[PublicationType.EDITED_COLLECTION];
        break;
      case(PublicationType.THESIS):
        this.editFormConfig = this.editFormConfigs[PublicationType.THESIS];
        break;
      case(PublicationType.WEBSITE):
        this.editFormConfig = this.editFormConfigs[PublicationType.WEBSITE];
        break;
      case(PublicationType.OTHER):
        this.editFormConfig = this.editFormConfigs[PublicationType.OTHER];
        break;
      default:
        console.log("Error in validation setup!");
    }

    this.editForm.clearValidators();

    this.editForm.addValidators(this.authorsEditorsTranslatorsNotProvided());

    if (this.editFormConfig.validateAuthors){
      this.authors.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateEditors){
      this.editors.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateTranslators){
      this.translators.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateTitle){
      this.title.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateUrl){
      this.url.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateBookEditors){
      this.bookEditors.addValidators(Validators.required);
    }
    if (this.editFormConfig.validateBook){
      this.book.addValidators(Validators.required);
    }
    if (this.editFormConfig.validatePlaceOfPublication){
      this.placeOfPublication.addValidators(Validators.required);
    }
    if (this.editFormConfig.validatePublisher){
      this.publisher.addValidators(Validators.required);
    }
    if (this.editFormConfig.validatePublicationYear){
      this.publicationYear.addValidators(Validators.required);
    }
    if (this.editFormConfig.validatePageNumbers){
      this.pageNumbers.addValidators(Validators.required);
    }
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
    this.editForm.updateValueAndValidity();

    if (this.editForm.valid){
      var editAddModal = document.getElementById('editAddBib');
      if (editAddModal != null){
        var modal = Modal.getInstance(editAddModal);
        modal?.toggle();
      }

      if (this.mode === Mode.ADD){
        console.log("Add mode!");
        this.postBib();
      }

      if (this.mode === Mode.EDIT){
        console.log("Edit mode!");
        this.updateBib();
      }
    }
    else{
      this.showValidationErrors = true;
    }
  }

  fillForm(){
    this.authors.setValue(this.activeBib.authors);
    this.editors.setValue(this.activeBib.editors);
    this.translators.setValue(this.activeBib.translators);
    this.title.setValue(this.activeBib.title);
    this.url.setValue(this.activeBib.url);
    this.bookEditors.setValue(this.activeBib.bookEditors);
    this.book.setValue(this.activeBib.book);
    this.bookSeries.setValue(this.activeBib.bookSeries);
    this.volume.setValue(this.activeBib.volume);
    this.numOfVolumes.setValue(this.activeBib.numOfVolumes);
    this.placeOfPublication.setValue(this.activeBib.placeOfPublication);
    this.publisher.setValue(this.activeBib.publisher);
    this.publicationYear.setValue(this.activeBib.publicationYear);
    this.pageNumbers.setValue(this.activeBib.pageNumbers);
    this.recommended.setValue(this.activeBib.recommended);
  }

  fillBibDto(){
    this.activeBib.publicationType = this.convertUiToEnum(this.type.value);
    this.activeBib.authors = this.authors.value;
    this.activeBib.editors = this.editors.value;
    this.activeBib.translators = this.translators.value;
    this.activeBib.title = this.title.value;
    this.activeBib.url = this.url.value;
    this.activeBib.bookEditors = this.bookEditors.value;
    this.activeBib.book = this.book.value;
    this.activeBib.bookSeries = this.bookSeries.value;
    this.activeBib.volume = this.volume.value;
    this.activeBib.numOfVolumes = this.numOfVolumes.value;
    this.activeBib.placeOfPublication = this.placeOfPublication.value;
    this.activeBib.publisher = this.publisher.value;
    this.activeBib.publicationYear = this.publicationYear.value;
    this.activeBib.pageNumbers = this.pageNumbers.value;
    this.activeBib.recommended = this.recommended.value;
  }

  navigateToBibEntryPage(id: number){
    this.router.navigate([`bib/${id}`]);
  }

  navigateToBibAllPage(){
    this.router.navigate([`bib`]);
  }

  authorsEditorsTranslatorsNotProvided(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      if (
        value.authors.trim() !== "" ||
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
        this.navigateToBibEntryPage(receivedBib.id);
      },
      error: err => {
        console.log('Error updating bib: ' + err)
      }
    })
  }
}
