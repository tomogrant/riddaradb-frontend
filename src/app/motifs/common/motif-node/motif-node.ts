import { OnInit, Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core'; 
import { MotifStore } from '../motif.store';
import { MotifModalService } from '../motif-modal.service';
import { ISagaVersionTitleDto } from '../../../sagas/common/ISagaVersionTitleDto';
import { SagaService } from '../../../sagas/common/saga.service';


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

  $nodeId = input.required<number>();
  $node = computed(() => this.motifStore.$motifNodes().get(this.$nodeId()));

  $expanded = computed(() => this.motifStore.$expandedNodes().has(this.$nodeId()));
  $visible = computed(() => this.motifStore.$visibleNodes().has(this.$nodeId()));
  $result = computed(() => this.motifStore.$resultNodes().has(this.$nodeId()));

  $searchActive = computed(() => this.motifStore.$searchActive());
  $searchTerm = computed(() => this.motifStore.$searchTerm());
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

  parentSaga = new Map<number, number>();

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

  highlightText(textToHighlight: string | undefined) {
    if (textToHighlight){
        return textToHighlight.replace(this.$searchTerm(), ("<mark>" + this.$searchTerm() + "</mark>"));
    }
    else {
      return null;
    }
  }

}

