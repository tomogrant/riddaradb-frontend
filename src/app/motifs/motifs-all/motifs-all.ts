import {OnInit, Component, inject, effect, computed, signal} from '@angular/core';
import {form, FormField, minLength, required} from '@angular/forms/signals';
import { MotifService } from '../common/motif.service';
import { MotifNode } from '../common/motif-node/motif-node';
import { Modal } from 'bootstrap';
import { IMotif } from '../common/IMotif';
import { MotifStore } from '../common/motif.store';
import { MotifModalService } from '../common/motif-modal.service';
import { Mode } from '../../shared/Enums';
import { QuillModule } from 'ngx-quill';

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

  readonly Mode = Mode;

  showValidationErrors: boolean = false;

  $editModel = signal({
    motifCode: '',
    motifName: '',
    description: ''
  });

  editForm = form(this.$editModel, (fieldPath => {
    required(fieldPath.motifCode), {message: 'Motif code is required.'},

    required(fieldPath.motifName), {message: 'Motif name is required.'}
  }))


  //SIGNALS
  $rootIds = this.motifStore.$rootIds;

  $modalState = this.motifModalService.$modalState;

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
    this.motifStore.getRootMotifs();
  }

  openAddModal(){
    this.motifModalService.openAddModal(0);
  }

  setForm(){
    this.showValidationErrors = false;
    const currentNode = this.$currentNode();
    if (this.$modalState()?.mode == Mode.ADD){
      this.editForm.motifCode().value.set('');
      this.editForm.motifName().value.set('');
      this.editForm.description().value.set('');
    }
    if (this.$modalState()?.mode == Mode.EDIT){
      if (!currentNode)
        return;
      this.editForm.motifCode().value.set(currentNode.motifCode);
      this.editForm.motifName().value.set(currentNode.motifName);
      this.editForm.description().value.set(currentNode.description);
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
            id: 0,
            motifCode: this.editForm.motifCode().value(),
            motifName: this.editForm.motifName().value(),
            description: this.editForm.description().value(),
            //If adding child node, set parent. Otherwise, if there's no parent (root node), pass 0.
            parentId: !currentNode ? 0 : currentNode.id
        });
      }
      if (this.$modalState()?.mode == Mode.EDIT){
        if (!currentNode)
          return;
        console.log(currentNode.hasChildren);
        this.motifStore.putMotifNode({
          ...currentNode,
          motifCode: this.editForm.motifCode().value(),
          motifName: this.editForm.motifName().value(),
          description: this.editForm.description().value(),
          hasChildren: currentNode.hasChildren
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
