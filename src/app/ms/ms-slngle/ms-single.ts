import { FormGroup, FormControl, FormGroupName, FormArray, ReactiveFormsModule, Validators } from "@angular/forms";
import { Component } from "@angular/core";
import { Modal } from "bootstrap";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { MsService } from "../common/ms.service";
import { CommonModule } from "@angular/common";
import { IMs } from "../common/IMs";
import { Mode } from "../../shared/Enums";
import { IMsRepositoryDto } from "../common/IMsRepositoryDto";
import { SagaService } from "../../sagas/common/saga.service";
import { ISagaTitleDto } from "../../sagas/common/ISagaTitleDto";
import { QuillModule } from "ngx-quill";
import { IMsSaga } from "../common/IMsSaga";
import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { PageHeader } from "../../page-header/page-header";

@Component({
  selector: "app-ms-single",
  imports: [CommonModule, RouterModule, ReactiveFormsModule, QuillModule, PageHeader],
  templateUrl: "./ms-single.html",
  styleUrl: "./ms-single.css",
})
export class MsSingle {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private msService: MsService,
    private sagaService: SagaService,
    private title: Title,
  ) {}

  //Forms
  editForm = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    name: new FormControl<string>(""),
    shelfmark: new FormControl<string>("", [Validators.required, this.shelfmarkUnique()]),
    description: new FormControl<string>(""),
    msSagas: new FormArray<FormGroup>([]),
  });

  get id() {
    return this.editForm.get("id") as FormControl;
  }

  get name() {
    return this.editForm.get("name") as FormControl;
  }

  get shelfmark() {
    return this.editForm.get("shelfmark") as FormControl;
  }

  get description() {
    return this.editForm.get("description") as FormControl;
  }

  get msSagas() {
    return this.editForm.get("msSagas") as FormArray<FormGroup>;
  }

  showValidationErrors: boolean = false;

  sagas: ISagaTitleDto[] = [];
  activeMs: IMs = this.initialiseMs();
  manuscriptsInRepo: IMs[] = [];
  repo: IMsRepositoryDto = this.initialiseRepository();

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  index: number = 0;

  ngOnInit() {
    this.setup();
  }

  setup() {
    const mode = this.route.snapshot.paramMap.get("mode");
    const repoId = this.route.snapshot.paramMap.get("repoid");
    this.activeMs.msRepositoryId = Number(repoId);

    const id = Number(this.route.snapshot.paramMap.get("id"));

    //ADD MODE
    if (mode == "add") {
      this.getSagas();
      this.getRepo();
      this.addMs();
    } else if (!Number.isNaN(id)) {
      this.msService.getMsEntryById(id).subscribe((receivedEntry) => {
        if (receivedEntry == null) {
          console.log("Ms entry not found");
          this.navigateToMsAllPage();
        }
        this.activeMs = receivedEntry;
        this.title.setTitle("riddaraDB - " + this.activeMs.shelfmark);
        this.getSagas();
        this.getRepo();
      });
    } else {
      console.log("parameter is incorrect");
      this.navigateToMsAllPage();
    }
  }

  initialiseSagaMsForms() {
    this.msSagas.clear();

    this.sagas.forEach((saga) => {
      var msSaga = this.activeMs.msSagaDtos.find((msSagaInMs) => msSagaInMs.sagaId == saga.id);
      this.msSagas.push(this.createSagaMsFormGroup(saga, msSaga));
    });
  }

  createSagaMsFormGroup(saga: ISagaTitleDto, msSaga?: IMsSaga): FormGroup {
    const selected = !!msSaga;

    const sagaForm = new FormGroup({
      trackingId: new FormControl(this.index++),
      sagaId: new FormControl(saga.id),
      sagaTitle: new FormControl(saga.title),
      folioNumber: new FormControl<string | null>(
        {
          value: msSaga?.folioNumber ?? null,
          disabled: !selected,
        },
        Validators.required,
      ),
      selected: new FormControl<boolean>(selected),
    });

    this.configureFolioNumberState(sagaForm);

    return sagaForm;
  }

  //When the checkbox is checked, makes folio number field available;
  //when unchecked, field is disabled and contents are set to null
  configureFolioNumberState(form: FormGroup) {
    form.get("selected")!.valueChanges.subscribe((selected) => {
      const folioNumber = form.get("folioNumber");

      if (folioNumber) {
        if (selected) {
          folioNumber?.enable();
        } else {
          folioNumber?.disable();
          folioNumber?.setValue(null);
        }
      }
    });
  }

  setMsSagaTitles() {
    this.activeMs.msSagaDtos.forEach((dto) => {
      const saga = this.sagas.find((saga) => dto.sagaId == saga.id);
      if (saga) dto.sagaTitle = saga.title;
    });
  }

  editMs() {
    this.mode = Mode.EDIT;
    this.showValidationErrors = false;

    this.id.setValue(this.activeMs.id);
    this.name.setValue(this.activeMs.name);
    this.shelfmark.setValue(this.activeMs.shelfmark);
    this.description.setValue(this.activeMs.description);

    this.openAddEditModal();
  }

  addMs() {
    this.mode = Mode.ADD;
    this.showValidationErrors = false;

    //Form is already initialised, so no need to reset values here
    this.openAddEditModal();
  }

  submitAddOrEdit() {
    this.shelfmark.updateValueAndValidity();

    const formValue = this.editForm.getRawValue();

    const payload = {
      id: formValue.id,
      name: formValue.name,
      shelfmark: formValue.shelfmark!,
      description: formValue.description ? formValue.description.replaceAll(/((?:&nbsp;)*)&nbsp;/g, "$1 ") : null,
      msSagaDtos: formValue.msSagas
        .filter((saga) => saga["selected"])
        .map((saga) => ({
          sagaId: saga["sagaId"],
          folioNumber: saga["folioNumber"],
        })),
      msRepositoryId: this.activeMs.msRepositoryId,
    };

    if (this.editForm.valid) {
      if (this.mode === Mode.ADD) {
        this.postMs(payload);
      } else if (this.mode === Mode.EDIT) {
        this.updateMs(payload);
      }
    } else {
      this.showValidationErrors = true;
    }
  }

  getSagas() {
    this.sagaService.getSagaTitles().subscribe((sagas) => {
      this.sagas = [];
      sagas.forEach((saga) => this.sagas.push(saga));
      this.sagas.sort((a, b) => a.title.localeCompare(b.title));

      this.setMsSagaTitles();
      this.activeMs.msSagaDtos.sort((a, b) =>
        a.folioNumber?.localeCompare(b.folioNumber, undefined, { numeric: true }),
      );

      this.initialiseSagaMsForms();
    });
  }

  getRepo() {
    this.msService.getMsRepository(this.activeMs.msRepositoryId).subscribe((repo) => {
      this.repo = repo;

      if (this.repo.id) {
        this.msService.getMsEntriesByRepoId(this.repo?.id).subscribe((msEntries) => {
          this.manuscriptsInRepo = msEntries;
        });
      }
    });
  }

  navigateToMsAllPage() {
    this.closeAddEditModal();
    this.router.navigate([`ms`]);
  }

  navigateToMsEntryPage(id: number) {
    this.closeAddEditModal();
    this.router.navigate([`ms/${id}`]);
  }

  openAddEditModal() {
    var editAddModal = document.getElementById("addEditMs");
    if (editAddModal != null) {
      var modal = Modal.getOrCreateInstance(editAddModal);
      modal?.show();
    }
  }

  closeAddEditModal() {
    var editAddModal = document.getElementById("addEditMs");
    if (editAddModal != null) {
      var modal = Modal.getInstance(editAddModal);
      modal?.hide();
    }
  }

  openDeleteModal() {
    var deleteModal = document.getElementById("deleteMs");
    if (deleteModal != null) {
      var modal = Modal.getOrCreateInstance(deleteModal);
      modal?.show();
    }
  }

  closeDeleteModal() {
    var deleteModal = document.getElementById("deleteMs");
    if (deleteModal != null) {
      var modal = Modal.getInstance(deleteModal);
      modal?.hide();
    }
  }

  postMs(payload: IMs) {
    this.msService.postMs(payload).subscribe({
      next: (ms) => {
        this.activeMs = ms;
        this.setMsSagaTitles();
        this.activeMs.msSagaDtos.sort((a, b) =>
          a.folioNumber?.localeCompare(b.folioNumber, undefined, { numeric: true }),
        );
        this.closeAddEditModal();
        if (this.activeMs.id) {
          this.navigateToMsEntryPage(this.activeMs.id);
        }
      },
      error: (err) => {
        "Post MS failed";
      },
    });
  }

  updateMs(payload: IMs) {
    this.msService.putMs(payload).subscribe({
      next: (ms) => {
        this.activeMs = ms;
        this.setMsSagaTitles();
        this.activeMs.msSagaDtos.sort((a, b) =>
          a.folioNumber?.localeCompare(b.folioNumber, undefined, { numeric: true }),
        );
        this.closeAddEditModal();
      },
      error: (err) => {
        "Update MS failed";
      },
    });
  }

  deleteMs() {}

  initialiseMs(): IMs {
    return {
      id: null,
      name: "",
      shelfmark: "",
      description: "",
      msSagaDtos: [],
      msRepositoryId: 0,
    };
  }

  initialiseRepository() {
    return {
      id: null,
      name: "",
      msIds: [],
    };
  }

  shelfmarkUnique(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? "")
        .trim()
        .toLowerCase();

      if (!value) {
        return null;
      }

      const duplicate = this.manuscriptsInRepo.find(
        (ms) => ms.shelfmark.trim().toLowerCase() === value && ms.id !== control.parent?.get("id")?.value,
      );

      return duplicate ? { shelfmarkNotUnique: true } : null;
    };
  }
}
