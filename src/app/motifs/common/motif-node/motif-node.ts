import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core'; 
import { MotifStore } from '../motif.store';

@Component({
  selector: 'app-motif-node',
  imports: [],
  templateUrl: './motif-node.html',
  styleUrl: './motif-node.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotifNode {
  motifStore = inject(MotifStore);

  $nodeId = input.required<number>();

  $node = computed(() => this.motifStore.getMotifNode(this.$nodeId()));

  //True if the motif store has expanded this motif node. 
  $expanded = computed(() => this.motifStore.$expandedNodes().has(this.$nodeId()));

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

}

