import {OnInit, Component, inject, signal} from '@angular/core';
import { MotifService } from '../common/motif.service';
import { MotifNode } from '../common/motif-node/motif-node';
import { IMotif } from '../common/IMotif';
import { MotifStore } from '../common/motif.store';

@Component({
  selector: 'app-motifs-all',
  imports: [MotifNode],
  templateUrl: './motifs-all.html',
  styleUrl: './motifs-all.css',
})
export class MotifsAll {

  private motifStore = inject(MotifStore);

  $rootIds = this.motifStore.$rootIds;

  ngOnInit(){
    this.motifStore.getRootMotifs();
  }

}
