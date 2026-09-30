import {
  FormGroup,
  FormControl,
  FormArray,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from "@angular/forms";
import { AuthService } from "../../auth/auth.service";
import { Title } from "@angular/platform-browser";
import { Collapse, Modal } from "bootstrap";
import { Component, computed, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { CommonModule, formatDate } from "@angular/common";
import { QuillModule } from "ngx-quill";
import { IBib, PublicationType } from "../../bib/common/IBib";
import { BibService } from "../../bib/common/bib.service";
import { SagaService } from "../common/saga.service";
import { SagaMapper } from "../common/saga.mapper";
import { SagaDate } from "../common/SagaDate";
import { Mode } from "../../shared/Enums";
import { IBibVm } from "../../bib/common/IBibVm";
import { BibMapper } from "../../bib/common/bib.mapper";
import { ISagaVersionVm } from "../common/ISagaVersionVm";
import { IMotif } from "../../motifs/common/IMotif";
import { ISagaVm } from "../common/ISagaVm";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { IMs } from "../../ms/common/IMs";
import { MsService } from "../../ms/common/ms.service";
import { ISagaTitleDto } from "../common/ISagaTitleDto";
import { PageHeader } from "../../page-header/page-header";

@Component({
  selector: "app-saga-entry",
  imports: [CommonModule, RouterModule, ReactiveFormsModule, QuillModule, PageHeader],
  templateUrl: "./sagas-single.html",
  styleUrl: "./sagas-single.css",
})
export class SagasSingle implements OnInit {
  private route = inject(ActivatedRoute);
  private sagasService = inject(SagaService);
  private bibService = inject(BibService);
  private msService = inject(MsService);
  private sagaMapper = inject(SagaMapper);
  private bibMapper = inject(BibMapper);
  private router = inject(Router);
  private pageTitle = inject(Title);
  private authService = inject(AuthService);

  $loggedIn = computed(() => this.authService.$loggedIn());
  $isAdmin = computed(() => this.authService.$isAdmin());

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
  filteredMsForms: {
    form: FormGroup;
    index: number;
  }[] = [];

  showValidationErrors: boolean = false;

  copyButtonClicked = false;
  date: string = formatDate(Date.now(), "longDate", "en-UK");

  selectADateText: string = "Select a date:";
  sagaDatesUi: string[] = [];

  //---------------
  //  INIT
  //---------------

  ngOnInit() {
    const mode = this.route.snapshot.paramMap.get("mode");

    //ADD MODE
    if (mode == "add") {
      this.addSaga();
      this.getSagaTitles();
      this.getBibs();
      this.getManuscripts();
    } else {
      this.getSaga();
    }

    for (let sagaDate of Object.values(SagaDate)) {
      this.sagaDatesUi.push(this.mapDateToUi(sagaDate));
    }
    //Filters out "UNDEFINED"
    this.sagaDatesUi = this.sagaDatesUi.filter(sagaDate => sagaDate.startsWith("1"));
    this.sagaDatesUi.forEach(date => console.log(date));

    this.bibFilter.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe({
      next: (value) => this.updateBibFilter(value ? String(value).trim().toLowerCase() : ""),
    });

    this.msFilter.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe({
      next: (value) => this.updateMsFilter(value ? String(value).trim().toLowerCase() : ""),
    });
  }

  //---------------
  //  FORMS
  //---------------

  editForm = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    title: new FormControl<string>("", { validators: [Validators.required, this.sagaTitleUnique()] }),
    translatedTitle: new FormControl<string>("", Validators.required),
    translated: new FormControl<boolean>(false),
    description: new FormControl<string>(""),
    sagaVersionForms: new FormArray<FormGroup>([]),
    bibFilter: new FormControl<string>(""),
    bibIds: new FormControl<number[]>([]),
    msForms: new FormArray<FormGroup>([]),
    msFilter: new FormControl<string>(""),
  });

  get title(): FormControl {
    return this.editForm.controls.title;
  }

  get translatedTitle(): FormControl {
    return this.editForm.controls.translatedTitle;
  }

  get translated(): FormControl {
    return this.editForm.controls.translated;
  }

  get description(): FormControl {
    return this.editForm.controls.description;
  }

  get sagaVersionForms(): FormArray<FormGroup> {
    return this.editForm.controls.sagaVersionForms;
  }

  get bibFilter(): FormControl {
    return this.editForm.controls.bibFilter;
  }

  get bibIds(): FormControl {
    return this.editForm.controls.bibIds;
  }

  get msForms(): FormArray<FormGroup> {
    return this.editForm.controls.msForms;
  }

  get msFilter() {
    return this.editForm.get("msFilter") as FormControl;
  }

  createSagaVersionForm(sagaVersion?: ISagaVersionVm) {
    return new FormGroup({
      trackingId: new FormControl<number>(this.sagaVersionTrackingId++, { nonNullable: true }),
      id: new FormControl<number | null>({ value: sagaVersion ? sagaVersion.id : null, disabled: true }),
      title: new FormControl<string>(sagaVersion ? sagaVersion.title : "", {
        nonNullable: true,
        validators: [Validators.required, this.sagaVersionTitleUnique()],
      }),
      date: new FormControl<string>(sagaVersion ? this.mapDateToUi(sagaVersion.date) : this.selectADateText, {
        nonNullable: true,
        validators: this.dateNotSelected(),
      }),
      description: new FormControl<string>(sagaVersion ? sagaVersion.description : ""),
    });
  }

  populateMsForms() {
    this.msForms.clear();
    this.manuscripts.forEach((ms) => {
      const msForm = this.createMsForm(ms);
      this.configureMsForm(msForm);

      this.msForms.push(msForm);
    });
    //Rebuilding the collection is necessary to avoid stale tracking in the template
    this.updateMsFilter();
  }

  createMsForm(ms: IMs) {
    const msInSaga = this.sagaEntry.manuscripts.find((msDto) => msDto.msId == ms.id);
    const selected = !!msInSaga;

    return new FormGroup({
      trackingId: new FormControl<number>({ value: this.sagaVersionTrackingId++, disabled: true }),
      msId: new FormControl<number | null>({ value: ms.id, disabled: true }),
      shelfmark: new FormControl<string>({ value: ms.shelfmark, disabled: true }),
      date: new FormControl<string>({ value: ms.date, disabled: true }),
      folioNumber: new FormControl<string | null>(
        { value: msInSaga ? msInSaga.folioNumber : null, disabled: !selected },
        Validators.required,
      ),
      note: new FormControl<string | null | undefined>({
        value: msInSaga ? msInSaga.note : null,
        disabled: !selected,
      }),
      selected: new FormControl<boolean>(!!msInSaga),
    });
  }

  configureMsForm(msForm: FormGroup) {
    msForm.get("selected")!.valueChanges.subscribe((selected) => {
      const folioNumber = msForm.get("folioNumber");
      const note = msForm.get("note");

      if (folioNumber) {
        if (selected) {
          folioNumber.enable();
        } else {
          folioNumber.disable();
          folioNumber.setValue(null);
        }
      }
      if (note) {
        if (selected) {
          note.enable();
        } else {
          note.disable();
          note.setValue(null);
        }
      }
    });
  }

  //---------------
  //  FIELD LOGIC
  //---------------

  openAddEditModal() {
    var addEditModal = document.getElementById("addEditSaga");
    if (addEditModal != null) {
      var modal = Modal.getOrCreateInstance(addEditModal);
      if (modal != null) {
        modal.show();
      }
    }
  }

  closeAddEditModal() {
    var addEditModal = document.getElementById("addEditSaga");
    if (addEditModal != null) {
      var modal = Modal.getInstance(addEditModal);
      if (modal != null) {
        modal.hide();
      }
    }
  }

  openDeleteModal() {
    var deleteModal = document.getElementById("deleteSaga");
    if (deleteModal != null) {
      var modal = Modal.getOrCreateInstance(deleteModal);
      if (modal != null) {
        modal.show();
      }
    }
  }

  closeDeleteModal() {
    var deleteModal = document.getElementById("deleteSaga");
    if (deleteModal != null) {
      var modal = Modal.getInstance(deleteModal);
      if (modal != null) {
        modal.hide();
      }
    }
  }

  openCiteModal() {
    var citeModal = document.getElementById("citeSaga");
    if (citeModal != null) {
      var modal = Modal.getOrCreateInstance(citeModal);
      if (modal != null) {
        this.copyButtonClicked = false;
        modal.show();
      }
    }
  }

  closeCiteModal() {
    var citeModal = document.getElementById("citeSaga");
    if (citeModal != null) {
      var modal = Modal.getInstance(citeModal);
      if (modal != null) {
        modal.hide();
      }
    }
  }

  copyReference() {
    var ref: string =
      "A. User, " +
      "'" +
      this.sagaEntry.title +
      "', riddaraDB: Database of Medieval Icelandic Romance," +
      " ed. Tom Grant and Jonathan Y. H. Hui." +
      " Last accessed: " +
      this.date;

    navigator.clipboard.writeText(ref);
    this.copyButtonClicked = true;
  }

  initialiseSaga(): ISagaVm {
    return {
      id: null,
      title: "",
      translatedTitle: "",
      description: "",
      translated: false,
      sagaVersions: [],
      bibIds: [],
      primarySources: [],
      secondarySources: [],
      manuscripts: [],
    };
  }

  initialiseSagaVersion(): ISagaVersionVm {
    return {
      id: null,
      title: "",
      description: "",
      date: SagaDate.UNDEFINED,
      sagaId: 0,
      sagaMotifs: [],
    };
  }

  bibChecked(id: number): boolean {
    return this.bibIds.value.includes(id);
  }

  toggleBib(id: number) {
    const ids: number[] = this.bibIds.value;

    //If bibIds form includes id, filter it out. If not, add it.
    this.bibIds.setValue(ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id]);
  }

  updateBibFilter(searchTerm: string = "") {
    this.filteredBibVms = this.bibVms.filter((bib) =>
      bib.bibliographyEntry.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  updateMsFilter(searchTerm: string = "") {
    this.filteredMsForms = this.msForms.controls
      //Maps MS form and its index into object corresponding with filteredMsForms. 
      .map((form, index) => ({ form: form, index: index }))
      //Filter to only include those MS forms whose shelfmark matches query
      .filter((form) => String(form.form.get("shelfmark")?.value).trim().toLowerCase().includes(searchTerm));
  }

  mapDateToUi(sagaDate: SagaDate) {
    switch (sagaDate) {
      case SagaDate._1200_1250: {
        return "1200-1250";
      }
      case SagaDate._1250_1300: {
        return "1250-1300";
      }
      case SagaDate._1300_1350: {
        return "1300-1350";
      }
      case SagaDate._1350_1400: {
        return "1350-1400";
      }
      case SagaDate._1400_1450: {
        return "1400-1450";
      }
      case SagaDate._1450_1500: {
        return "1450-1500";
      }
      case SagaDate._1500_1550: {
        return "1500-1550";
      }
      default: {
        return this.selectADateText;
      }
    }
  }

  mapDateFromUi(sagaDate: string) {
    switch (sagaDate) {
      case "1200-1250": {
        return SagaDate._1200_1250;
      }
      case "1250-1300": {
        return SagaDate._1250_1300;
      }
      case "1300-1350": {
        return SagaDate._1300_1350;
      }
      case "1350-1400": {
        return SagaDate._1350_1400;
      }
      case "1400-1450": {
        return SagaDate._1400_1450;
      }
      case "1450-1500": {
        return SagaDate._1450_1500;
      }
      case "1500-1550": {
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
      translatedTitle: this.sagaEntry.translatedTitle,
      description: this.sagaEntry.description,
      translated: this.sagaEntry.translated,
      bibIds: [...this.sagaEntry.bibIds],
    });

    this.populateMsForms();

    this.sagaVersionForms.clear();
    this.sagaEntry.sagaVersions.forEach((sagaVersion) => {
      this.sagaVersionForms.push(this.createSagaVersionForm(sagaVersion));
    });
  }

  resetValidators() {
    this.title.updateValueAndValidity();
    this.translatedTitle.updateValueAndValidity();

    this.sagaVersionForms.controls.forEach((control) => {
      control.get("title")?.updateValueAndValidity();
    });
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

  navigateToSagasSinglePage(id: number) {
    this.closeAddEditModal();
    this.router.navigate([`sagas/${id}`]);
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
    //this.hideAccordion();
  }

  editSaga() {
    this.mode = Mode.EDIT;
    this.showValidationErrors = false;
    this.updateBibFilter();
    this.updateMsFilter();
    this.fillInputFields();
    this.openAddEditModal();
    this.hideAccordion();
  }

  hideAccordion() {
    const accordions = document.querySelectorAll("#addEditSaga .accordion-collapse");

    accordions.forEach((element) => {
      const accordionInstance = Collapse.getOrCreateInstance(element, { toggle: false });
      if (accordionInstance) accordionInstance.hide();
    });
  }

  submitAddOrEdit() {
    this.resetValidators();

    //If only one saga version under saga, set its title to the saga's title.
    if (this.sagaVersionForms.length == 1) {
      this.sagaVersionForms.at(0).get("title")?.setValue(this.title.value);
    }

    if (this.sagaVersionForms.length == 1) {
      this.sagaVersionForms.at(0).get("description")?.setValue("");
    }

    if (this.editForm.valid) {
      this.closeAddEditModal();

      if (this.mode === Mode.ADD) {
        this.postSaga();
      } else if (this.mode === Mode.EDIT) {
        this.updateSaga();
      }
    } else {
      this.showValidationErrors = true;
    }
  }

  deleteSaga() {
    this.closeDeleteModal();
    if (this.sagaEntry.id) {
      this.sagasService.deleteSaga(this.sagaEntry.id).subscribe({
        next: (deletedSaga) => {
          this.router.navigate([`sagas`]);
        },
      });
    }
  }

  //---------------
  //     CRUD
  //---------------

  //FILL VM
  formToVm() {
    this.sagaEntry.title = this.title.value;

    this.sagaEntry.translatedTitle = this.translatedTitle.value;

    //Ugly fix until Quill releases update
    if (this.description.value == null) {
      this.sagaEntry.description = "";
    } else {
      this.sagaEntry.description = String(this.description.value).replaceAll(/((?:&nbsp;)*)&nbsp;/g, "$1 ");
    }

    this.sagaEntry.translated = this.translated.value;

    this.sagaEntry.bibIds = [...this.bibIds.value];

    const msFormsRaw = this.msForms.getRawValue();

    msFormsRaw.forEach((msForm) => {
      console.log("Form selected: " + msForm["selected"]);
    });

    this.sagaEntry.manuscripts = msFormsRaw
      .filter((ms) => ms["selected"])
      .map((ms) => ({
        msId: ms["msId"],
        shelfmark: ms["shelfmark"],
        date: this.manuscripts.find((manuscript) => manuscript.id == ms["msId"])?.date ?? "",
        folioNumber: String(ms["folioNumber"]).trim(),
        note: ms["note"] == null ? null : String(ms["note"]).trim(),
      }));

    //Fill VM saga versions
    this.sagaVersions = [];

    for (var i = 0; i < this.sagaVersionForms.length; i++) {
      const sagaVersionForm = this.sagaVersionForms.controls[i];
      if (!sagaVersionForm) continue;

      const newSagaVersion = this.initialiseSagaVersion();
      this.sagaVersions.push(newSagaVersion);

      const sagaVersionFormId = sagaVersionForm.get("id");
      if (!sagaVersionFormId) this.sagaVersions[i].id = null;
      else this.sagaVersions[i].id = sagaVersionFormId.getRawValue();

      const sagaVersionFormTitle = sagaVersionForm.get("title");
      if (!sagaVersionFormTitle) this.sagaVersions[i].title = "";
      else this.sagaVersions[i].title = sagaVersionFormTitle.value;

      const sagaVersionFormDescription = sagaVersionForm.get("description");
      if (!sagaVersionFormDescription) this.sagaVersions[i].description = "";
      else
        this.sagaVersions[i].description = String(sagaVersionFormDescription.value).replaceAll(
          /((?:&nbsp;)*)&nbsp;/g,
          "$1 ",
        );

      const sagaVersionFormDate = sagaVersionForm.get("date");
      if (!sagaVersionFormDate) this.sagaVersions[i].date = SagaDate.UNDEFINED;
      else this.sagaVersions[i].date = this.mapDateFromUi(sagaVersionFormDate.value);
    }

    this.sagaEntry.sagaVersions = this.sagaVersions;
  }

  getSagaTitles() {
    this.sagasService.getSagaTitles().subscribe({
      next: (titles) => {
        console.log(this.sagaTitles);
        this.sagaTitles = titles;
      },
      error: (err) => {},
    });
  }

  getBibs() {
    //Create sorted list of bibliography entry VMs
    this.bibService.getBibEntries().subscribe({
      next: (bibEntries) => {
        this.bibs = bibEntries;
        this.bibVms = [];
        this.bibs.forEach((bib) => this.bibVms.push(this.bibMapper.mapDtoToVm(bib)));
        this.bibVms.sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));
        this.updateBibFilter();
      },
    });
  }

  getManuscripts() {
    this.msService.getMsEntries().subscribe({
      next: (msEntries) => {
        this.manuscripts = msEntries.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
        this.sagaEntry.manuscripts.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));

        this.populateMsForms();
        this.updateMsFilter();
      },
      error: (err) => {},
    });
  }

  //READ
  getSaga() {
    const id = this.route.snapshot.paramMap.get("id");

    if (id == null) return;
    //If saga id is valid, get saga
    this.sagasService.getSagaById(parseInt(id)).subscribe({
      next: (receivedEntry) => {
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedEntry);
        this.pageTitle.setTitle("riddaraDB - " + this.sagaEntry.title);
        this.getSagaTitles();
        this.getBibs();
        this.getManuscripts();
      },
      error: (err) => console.log(err),
    });
  }

  //UPDATE
  updateSaga() {
    this.formToVm();

    this.sagasService.putSaga(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry)).subscribe({
      next: (receivedSaga) => {
        console.log("Saved successfully! " + receivedSaga);
        this.sagaEntry = this.sagaMapper.mapSagaResponseDtoToVm(receivedSaga);
        this.sagaEntry.manuscripts.sort((a, b) => a.shelfmark.localeCompare(b.shelfmark));
      },
      error: (err) => {
        console.log("Problem with saving.");
      },
    });
  }

  //POST
  postSaga() {
    this.formToVm();

    console.log("Saga to be posted: ");
    console.log(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry));

    this.sagasService.postSaga(this.sagaMapper.mapSagaVmToRequestDto(this.sagaEntry)).subscribe({
      next: (receivedSaga) => {
        this.navigateToSagasSinglePage(receivedSaga.id);
      },
      error: (err) => {
        console.log("Problem with saving.");
      },
    });
  }

  //---------------
  // CUSTOM VALIDATION
  //---------------

  sagaTitleUnique(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? "")
        .trim()
        .toLowerCase();

      if (!value) {
        return null;
      }

      const duplicate = this.sagaTitles.find(
        (saga) => saga.title.trim().toLowerCase() === value && saga.id !== this.sagaEntry.id,
      );

      return duplicate ? { sagaTitleNotUnique: true } : null;
    };
  }

  sagaVersionTitleUnique(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? "")
        .trim()
        .toLowerCase();

      if (!value) {
        return null;
      }

      //Checks whether the user has entered a title which is already assigned to a
      //DIFFERENT saga in the database
      const duplicateTitleInSaga = this.sagaEntry.sagaVersions.find(
        (saga) => saga.title.trim().toLowerCase() === value && saga.id !== control.parent?.get("id")?.value,
      );

      //Checks whether the user has entered a title which is already assigned
      //to a saga within the form
      const trackingId = control.parent?.get("trackingId")?.value;
      const duplicateTitleInForm = this.sagaVersionForms.controls.find((versionControl) => {
        const versionControlTitle = String(versionControl.get("title")?.value ?? "")
          .trim()
          .toLowerCase();

        return versionControl.get("trackingId")?.value !== trackingId && versionControlTitle === value;
      });

      return duplicateTitleInSaga || duplicateTitleInForm ? { sagaVersionTitleNotUnique: true } : null;
    };
  }

  dateNotSelected(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      if (value === this.selectADateText) {
        return { dateNotSelected: true };
      } else {
        return null;
      }
    };
  }
}
