import { Component, inject, effect, computed, signal } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { form, FormField, required } from "@angular/forms/signals";
import { MotifNode } from "../motif-node/motif-node";
import { Modal } from "bootstrap";
import { MotifStore } from "../common/motif.store";
import { MotifModalService } from "../common/motif-modal.service";
import { Mode } from "../../shared/Enums";
import { QuillModule } from "ngx-quill";
import { IMotifForm } from "../common/IMotifForm";
import { PageHeader } from "../../page-header/page-header";
import { AuthService } from "../../auth/auth.service";

export interface MotifDetails {
  pageChapterNumber: string | null;
  inBoberg: boolean
}

@Component({
  selector: "app-motifs-all",
  imports: [MotifNode, FormField, QuillModule, PageHeader],
  templateUrl: "./motifs-all.html",
  styleUrl: "./motifs-all.css",
})
export class MotifsAll {
  constructor() {
    effect(() => {  
      if (this.$modalState() != null) {
        this.setForm();
        this.toggleModal();
      }
    });
  }
      
  private motifStore = inject(MotifStore);
  private motifModalService = inject(MotifModalService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  $loggedIn = computed(() => this.authService.$loggedIn());

  readonly Mode = Mode;

  showValidationErrors: boolean = false;

  $sagas = computed(() => this.motifStore.$sagaTitles());

  $editModel = signal<IMotifForm>({
    motifCode: "",
    motifName: "",
    description: "",
    sagas: [],
  });

  editForm = form(this.$editModel, (fieldPath) => {
    (required(fieldPath.motifCode),
      { message: "Motif code is required." },
      required(fieldPath.motifName),
      { message: "Motif name is required." });
  });

  $searchModel = signal({
    searchTerm: "",
  });

  searchForm = form(this.$searchModel);

  //SIGNALS
  $rootIds = this.motifStore.$rootIds;

  $modalState = this.motifModalService.$modalState;

  $showColourCoding = computed(() => this.motifStore.$showColourCoding());

  readonly selectedSagaMap = computed(() => {
    const map = new Map<number, MotifDetails>();

    for (const saga of this.$editModel().sagas) {
      map.set(saga.sagaVersionId, {
        pageChapterNumber: saga.pageChapterNumber,
        inBoberg: saga.inBoberg
      });
    }

    return map;
  });

  //Current node is whatever is sent by the recursive motif node component.
  //In the case of adding a child, this is the parent's ID.
  //In the case of editing or deleting, this is the ID of the motif to be edited.
  //If adding a root node via this page, the ID is null as it neither exists
  //nor has a parent.
  $currentNode = computed(() => {
    const state = this.$modalState();

    if (state?.motifId == null) {
      return null;
    }

    return this.motifStore.getMotifNode(state.motifId);
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.initialise(params);
    });
  }

  async initialise(params: ParamMap) {
    this.motifStore.initialise();
    await this.motifStore.getRootMotifs();
    await this.motifStore.getSagaTitles();

    const searchTerm = params.get("searchterm");
    if (!searchTerm) return;
    this.searchForm.searchTerm().value.set(searchTerm);
    this.motifStore.search(searchTerm, true);
  }

  updateSelection(id: number) {
    //Called when a checkbox next to a saga is clicked. Gets ID from DOM.
    //Removes saga (id, pageChapterNumber) from array or adds
    //with an empty pageChapterNumber
    this.$editModel.update((current) => {
      const index = current.sagas.findIndex((saga) => saga.sagaVersionId === id);
      //Saga already associated with motif; remove
      if (index >= 0) {
        return {
          ...current,
          //collection of sagas whose IDs do not match the ID provided
          sagas: current.sagas.filter(saga => saga.sagaVersionId !== id)
        }
      }

      //Saga not associated with motif; add
      return {
        ...current,
        sagas: [
          ...current.sagas,
          {
            sagaVersionId: id,
            pageChapterNumber: "",
            inBoberg: true
          }
        ]
      }
    });
  }

  updateBoberg(id: number){
    this.$editModel.update((current) => ({
      ...current,
      sagas: current.sagas.map(saga => 
        saga.sagaVersionId === id 
        ? {...saga, inBoberg: !saga.inBoberg}
        : saga
      )
      }));
  }

  //Called when a page/chapter number field associated with a saga changes
  pageChapterNumberUpdate(id: number, pageChapterNumber: string) {
    this.$editModel.update((current) => {
        return {
          ...current,
          sagas: current.sagas.map(saga => saga.sagaVersionId === id 
            ? {
                ...saga,
                pageChapterNumber: pageChapterNumber ?? ""
              }
            : saga)
        }
      }
    );
  }

  submitSearchRequest() {
    this.motifStore.search(this.$searchModel().searchTerm.trim(), false);
  }

  clearSearch() {
    this.searchForm.searchTerm().value.set("");
    this.motifStore.clearSearch();
  }

  collapseAll() {
    if (!this.motifStore.$searchActive()) this.motifStore.collapseAll();
  }

  toggleColourCoding() {
    this.motifStore.toggleColourCoding();
  }

  openAddModal() {
    //No motif ID is passed in here, as we
    //are adding a new root motif
    this.motifModalService.openAddModal();
  }

  setForm() {
    this.showValidationErrors = false;
    const currentNode = this.$currentNode();
    if (this.$modalState()?.mode == Mode.ADD) {
      this.$editModel.set({
        motifCode: "",
        motifName: "",
        description: "",
        sagas: [],
      });
    }
    if (this.$modalState()?.mode == Mode.EDIT) {
      if (!currentNode) return;
      this.$editModel.set({
        motifCode: currentNode.motifCode,
        motifName: currentNode.motifName,
        description: currentNode.description,
        sagas: currentNode.sagaMotifs.map(saga => ({...saga}))
      });
    }
  }

  toggleModal() {
    const templateModal =
      this.$modalState()?.mode == Mode.DELETE
        ? document.getElementById("deleteModal")
        : document.getElementById("editAddModal");

    if (templateModal != null) {
      var modal = Modal.getOrCreateInstance(templateModal);
      if (modal != null) {
        modal.toggle();
      }
    }
  }

  setModalStateToClose() {
    this.motifModalService.closeModal();
  }

  submitForm() {
    const currentNode = this.$currentNode();

    if (this.editForm.motifCode().valid() && this.editForm.motifName().valid()) {
      if (this.$modalState()?.mode == Mode.ADD) {
        this.motifStore.postMotifNode({
          id: null,
          motifCode: this.editForm.motifCode().value(),
          motifName: this.editForm.motifName().value(),
          description: this.editForm.description().value(),
          sagaMotifs: this.editForm.sagas().value(),
          //If adding child node, currentNode is the parent node; fill parentId.
          //If adding a root note, there is no parent; fill with null.
          parentId: !currentNode ? null : currentNode.id,
        });
      }
      if (this.$modalState()?.mode == Mode.EDIT) {
        if (!currentNode) return;
        this.motifStore.putMotifNode({
          ...currentNode,
          motifCode: this.editForm.motifCode().value(),
          motifName: this.editForm.motifName().value(),
          description: this.editForm.description().value(),
          hasChildren: currentNode.hasChildren,
          sagaMotifs: this.editForm.sagas().value(),
        });
      }

      this.motifModalService.$modalState.set(null);
      this.toggleModal();
    } else {
      this.showValidationErrors = true;
    }
  }

  deleteMotif() {
    const motifId = this.$currentNode()?.id;

    if (!motifId) return;
    this.motifStore.deleteMotifNode(motifId);
  }
}
