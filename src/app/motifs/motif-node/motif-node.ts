import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core'; 
import { MotifStore } from '../common/motif.store';
import { MotifModalService } from '../common/motif-modal.service';
import { SagaService } from '../../sagas/common/saga.service';


@Component({
  selector: 'app-motif-node',
  imports: [],
  templateUrl: './motif-node.html',
  styleUrl: './motif-node.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotifNode {
  motifStore = inject(MotifStore);
  motifModalService = inject (MotifModalService);
  sagaService = inject(SagaService);

  //Signals
  $nodeId = input.required<number>();
  $depth = input.required<number>();

  $node = computed(() => this.motifStore.$motifNodes().get(this.$nodeId()));

  $expanded = computed(() => this.motifStore.$expandedNodes().has(this.$nodeId()));
  $visible = computed(() => this.motifStore.$visibleNodes().has(this.$nodeId()));
  $result = computed(() => this.motifStore.$resultNodes().has(this.$nodeId()));

  $searchActive = computed(() => this.motifStore.$searchActive());
  $searchTerm = computed(() => this.motifStore.$searchTerm());
  $showColourCoding = computed(() => this.motifStore.$showColourCoding());

  $sagas = computed(() => this.motifStore.$sagaTitles());

  $assignedSagas = computed(() => {
    const node = this.$node();
    if (!node) return;

    const sagaVersions = [];

    for (const sagaMotif of node.sagaMotifs){
      const saga = this.$sagas().find(saga => saga.id === sagaMotif.sagaVersionId);
      if (saga){
        sagaVersions.push({
          sagaVersionId: sagaMotif.sagaVersionId,
          sagaTitle: saga.title,
          sagaId: saga.sagaId,
          pageChapterNumber: sagaMotif.pageChapterNumber
        });
      }
    }

    return sagaVersions.sort((a, b) => a.sagaTitle.localeCompare(b.sagaTitle));
  });

  nodeColour: string = '';

  //Functions
  ngOnInit(){
    this.setBackgroundColour();
  }

  toggle(){
    if (this.$expanded()){
      this.motifStore.collapse(this.$nodeId());
      return;
    }

    this.motifStore.expand(this.$nodeId());
    
    if (this.$node()?.hasChildren && !this.$node()?.childIds){
      this.motifStore.getMotifChildren(this.$nodeId());
    }
  }

  openAddModal(){
    console.log("Add button clicked");
    this.motifModalService.openAddModal(this.$nodeId());
  }

  openEditModal(){
    this.motifModalService.openEditModal(this.$nodeId());
  }

  openDeleteModal(){
    this.motifModalService.openDeleteModal(this.$nodeId());
  }

  resetModal(){
    this.motifModalService.closeModal();
  }

  setBackgroundColour(){
    switch (this.$depth()){
      case 1: 
        this.nodeColour = 'rgb(255, 213, 213)';
        break;
      case 2: 
        this.nodeColour = 'rgb(255, 235, 213)';
        break;
      case 3: 
        this.nodeColour = 'rgb(251, 255, 213)';
        break;
      case 4: 
        this.nodeColour = 'rgb(221, 255, 213)';
        break;
      case 5: 
        this.nodeColour = 'rgb(213, 248, 255)';
        break;
      case 6: 
        this.nodeColour = 'rgb(219, 213, 255)';
        break;
      case 7: 
        this.nodeColour = 'rgb(255, 213, 252)';
        break;
      default:
        return;
    }
  }

  highlightText(textToHighlight: string | undefined) {

    if (textToHighlight && textToHighlight.length > 0){
      var re = new RegExp(this.$searchTerm(), "i");
        return textToHighlight.replace(re, match => `<mark>${match}</mark>`);
    }
    else {
      return '';
    }
  }
}

