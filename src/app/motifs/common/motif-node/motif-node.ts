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
  $sagas = computed(() => this.motifStore.$sagaTitles());

  // children = computed(() => {
  //   console.log("Recalculating children...")
  //   const node = this.$node();

  //   if (!node?.childIds){
  //     return [];
  //   }

  //   return node.childIds
  //     .map(id => this.motifStore.getMotifNode(id))
  //     .filter((node): node is IMotif => node !== undefined)
  //     .sort((a, b) => a.motifCode.localeCompare(b.motifCode));
  // });

  //True if the motif store has expanded this motif node. 
  $expanded = computed(() => this.motifStore.$expandedNodes().has(this.$nodeId()));

  $assignedSagas = computed(() => {
    const node = this.$node();
    if (!node) return;

    const sagaVersions = [];
    for (const sagaMotif of node.sagaMotifs){
      const sagaTitle = this.$sagas().find(saga => saga.id === sagaMotif.sagaVersionId)?.title;
      if (sagaTitle){
        sagaVersions.push({
          sagaId: sagaMotif.sagaVersionId,
          sagaTitle: sagaTitle,
          pageChapterNumber: sagaMotif.pageChapterNumber
        });
      }
    }

    console.log(sagaVersions.length);
    return sagaVersions.sort((a, b) => a.sagaTitle.localeCompare(b.sagaTitle));
  });

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

}

