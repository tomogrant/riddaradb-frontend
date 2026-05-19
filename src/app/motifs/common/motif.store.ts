import { Injectable, inject, signal, computed } from "@angular/core";
import { IMotif } from "./IMotif";
import { MotifService } from "./motif.service";

@Injectable({
  providedIn: 'root'
})

export class MotifStore {

    motifService = inject(MotifService);

    //Motifs without parents; entry points into the trees
    $rootIds = signal<number[]>([]);

    //Normalised store of motifs
    $motifNodes = signal(new Map<number, IMotif>());

    //Sets to control which nodes are displayed
    $expandedNodes = signal(new Set<number>());
    $visibleNodes = signal(new Set<number>());

    getRootMotifs(){

        this.motifService.getRootMotifs().subscribe(roots => {
            this.$motifNodes.update(current => {
                const next = new Map(current);

                for (const root of roots){
                    next.set(root.id, root);
                }

                return next;
            });

            this.$rootIds.set(roots.map(root => root.id));
        })


    }

    //Gets motif node in store corresponding to ID. 
    getMotifNode(id: number){
        return this.$motifNodes().get(id);
    }

    setMotifNodes(motifNodes: IMotif[]){

        //update method takes current state (current) and returns updated state (next). 
        this.$motifNodes.update(current => {
            const next = new Map(current);

            for (const motifNode of motifNodes){
                next.set(motifNode.id, motifNode);
            }

            return next;
        });
    }

    updateMotifNode(updatedMotifNode: IMotif){
        this.$motifNodes.update(current => {
            const next = new Map(current);

            next.set(updatedMotifNode.id, updatedMotifNode);

            return next;
        });
    }

    getMotifChildren(id: number){
        this.motifService.getChildren(id).subscribe(children => {
            this.$motifNodes.update(current => {
                const next = new Map(current);

                for (var child of children){
                    next.set(child.id, child);
                }

                const parentMotif = next.get(id);
            
                if (parentMotif){
                    next.set(id, {
                        ...parentMotif,
                        childIds: children.map(child => child.id)
                    })
                }

                return next;
            });
        });


    }

    expand(id: number){
        this.$expandedNodes.update(current => {
            const next = new Set(current);
            next.add(id);

            return next;
        });
    }

    collapse(id: number){
        this.$expandedNodes.update(current => {
            const next = new Set(current);
            next.delete(id);

            return next;
        });
    }

}