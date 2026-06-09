import {Component, inject, effect, computed, signal} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {form, FormField, required} from '@angular/forms/signals';
import { MotifNode } from '../common/motif-node/motif-node';
import { Modal } from 'bootstrap';
import { MotifStore } from '../common/motif.store';
import { MotifModalService } from '../common/motif-modal.service';
import { Mode } from '../../shared/Enums';
import { QuillModule } from 'ngx-quill';
import { IMotifForm } from '../common/IMotifForm';

@Component({
  selector: 'app-motifs-all',
  imports: [MotifNode, FormField, QuillModule],
  templateUrl: './motifs-all.html',
  styleUrl: './motifs-all.css',
})
export class MotifsAll {

  constructor(){
      effect(() =>{
        if (this.$modalState() != null){
          this.setForm();
          this.toggleModal();
        }
    });
  }

  private motifStore = inject(MotifStore);
  private motifModalService = inject(MotifModalService);
  private route = inject(ActivatedRoute);

  readonly Mode = Mode;

  showValidationErrors: boolean = false;

  $sagas = computed(() => this.motifStore.$sagaTitles());

  $editModel = signal<IMotifForm>({
    motifCode: '',
    motifName: '',
    description: '',
    sagas: []
  });

  editForm = form(this.$editModel, (fieldPath => {
    required(fieldPath.motifCode), {message: 'Motif code is required.'},
    required(fieldPath.motifName), {message: 'Motif name is required.'}
  }));

  $searchModel = signal({
    searchTerm: ''
  });

  searchForm = form(this.$searchModel);

  //SIGNALS
  $rootIds = this.motifStore.$rootIds;

  $modalState = this.motifModalService.$modalState;

  $showColourCoding = computed(() => (this.motifStore.$showColourCoding()));

  readonly selectedSagaMap = computed(() => {
    const map = new Map<number, string | null>();

    for (const saga of this.$editModel().sagas) {
      map.set(saga.sagaVersionId, saga.pageChapterNumber);
    }

    return map;
  });

  //Current node is whatever is sent by the recursive motif node component. 
  //In the case of adding, this is the parent ID, if this exists. 
  //In the case of editing or deleting, this is the motif ID itself. 
  $currentNode = computed(() =>{
    const state = this.$modalState();

    if (state?.motifId == null){
      return null;
    }

    return this.motifStore.getMotifNode(state.motifId);
  });

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
      this.initialise(params);
    });
  }

  async initialise(params: ParamMap){
      this.motifStore.initialise();
      await this.motifStore.getRootMotifs();
      await this.motifStore.getSagaTitles();

      const searchTerm = params.get('searchterm');
      if (!searchTerm) return;
      this.searchForm.searchTerm().value.set(searchTerm);
      this.motifStore.search(searchTerm, true);
  }

  checkboxUpdate(id: number){
    this.$editModel.update(current => {
      const sagas = current.sagas;
      const index = sagas.findIndex(saga => saga.sagaVersionId === id);
      //Saga already associated with motif; remove
      if (index >= 0){
        sagas.splice(index, 1);
      }
      //Saga not associated with motif; add
      else{
        sagas.push({
          sagaVersionId: id,
          pageChapterNumber: ''
        });
      }

      return {
        ...current,
        sagas: sagas
      }
    });
  }

  pageChapterNumberUpdate(id: number, pageChapterNumber: string){
    this.$editModel.update(current => {
      const sagas = current.sagas;
      const index = sagas.findIndex(saga => saga.sagaVersionId === id);
      if (index >= 0){
        sagas[index].pageChapterNumber = pageChapterNumber;
      }

      return {
        ...current,
        sagas: sagas
      }
    });
  }

  submitSearchRequest(){
    this.motifStore.search(this.$searchModel().searchTerm, false);
  }

  clearSearch(){
    this.searchForm.searchTerm().value.set('');
    this.motifStore.clearSearch();
  }

  collapseAll(){
    if (!this.motifStore.$searchActive())
      this.motifStore.collapseAll();
  }

  toggleColourCoding(){
    this.motifStore.toggleColourCoding();
  }

  openAddModal(){
    this.motifModalService.openAddModal(0);
  }

  setForm(){
    this.showValidationErrors = false;
    const currentNode = this.$currentNode();
    if (this.$modalState()?.mode == Mode.ADD){
      this.$editModel.set({
        motifCode: '',
        motifName: '',
        description: '',
        sagas: []
      });
    }
    if (this.$modalState()?.mode == Mode.EDIT){
      if (!currentNode) return;
      this.$editModel.set({
        motifCode: currentNode.motifCode,
        motifName: currentNode.motifName,
        description: currentNode.description,
        sagas: currentNode.sagaMotifs
      });
    }
  }

  toggleModal(){
    if (this.$modalState()?.mode == Mode.DELETE){
      var templateModal = document.getElementById('deleteModal');
    }
    else{
      var templateModal = document.getElementById('editAddModal');
    }

    if (templateModal != null){
      var modal = Modal.getOrCreateInstance(templateModal);
      if (modal != null){
        modal.toggle();
      }
    }
  }

  setModalStateToClose(){
    this.motifModalService.closeModal();
  }

  submitForm(){
    const currentNode = this.$currentNode();

    if (this.editForm.motifCode().valid() && this.editForm.motifName().valid()){
      if (this.$modalState()?.mode == Mode.ADD){
          this.motifStore.postMotifNode({
            id: null,
            motifCode: this.editForm.motifCode().value(),
            motifName: this.editForm.motifName().value(),
            description: this.editForm.description().value(),
            sagaMotifs: this.editForm.sagas().value(),
            //If adding child node, set parent. Otherwise, if there's no parent (root node), pass 0.
            parentId: !currentNode ? null : currentNode.id
        });
      }
      if (this.$modalState()?.mode == Mode.EDIT){
        if (!currentNode) return;
        this.motifStore.putMotifNode({
          ...currentNode,
          motifCode: this.editForm.motifCode().value(),
          motifName: this.editForm.motifName().value(),
          description: this.editForm.description().value(),
          hasChildren: currentNode.hasChildren,
          sagaMotifs: this.editForm.sagas().value()
        });
      }

        this.motifModalService.$modalState.set(null);
        this.toggleModal();
    }
    else {
      this.showValidationErrors = true;
    }
  }

  deleteMotif(){
    const motifId = this.$currentNode()?.id;

    if (!motifId) return;
    this.motifStore.deleteMotifNode(motifId);
  }
}
