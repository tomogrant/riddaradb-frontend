import { Injectable, inject, signal, computed } from "@angular/core";
import { IMotif } from "./IMotif";
import { MotifService } from "./motif.service";
import { SagaService } from "../../sagas/common/saga.service";
import { ISagaVersionTitleDto } from "../../sagas/common/ISagaVersionTitleDto";

@Injectable({
  providedIn: 'root'
})

export class MotifStore {

    motifService = inject(MotifService);
    sagaService = inject(SagaService);

    $sagaTitles = signal(new Array<ISagaVersionTitleDto>);

    //Motifs without parents; entry-points into the trees
    $rootIds = signal(new Set<number>);

    //Normalised store of motifs
    $motifNodes = signal(new Map<number, IMotif>());

    //Sets to control which nodes are displayed
    $expandedNodes = signal(new Set<number>());
    $visibleNodes = signal(new Set<number>());

    getSagaTitles(){
        this.sagaService.getSagaVersionTitles().subscribe(sagas => 
            this.$sagaTitles.set(sagas.sort((a, b) => a.title.localeCompare(b.title))));
    }


    filterMap(map: Map<number, IMotif>): Map<number, IMotif>{
        return new Map([...map].sort((a, b) => a[1].motifCode.localeCompare(b[1].motifCode)));
    }

    getRootMotifs(){
        this.motifService.getRootMotifs().subscribe(roots => {
            this.$motifNodes.update(current => {
                const next = new Map(current);

                for (const root of roots){
                    next.set(root.id, root);
                }

                return next;
            });

            this.$rootIds.update(current => {
                const next = new Set(current);
                roots.forEach(root => next.add(root.id));

                return next;
            });

            this.sortRootIds();
        });
    }

    addNewRootMotif(newRootMotif: IMotif){
        this.$motifNodes.update(current => {
            const next = new Map(current);

            next.set(newRootMotif.id, newRootMotif)

            return next;
        });

        this.$rootIds.update(current => {
            const next = new Set(current);

            next.add(newRootMotif.id);

            return next;
        });

        this.sortRootIds();
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

    assignChild(childMotifNode: IMotif){
        this.$motifNodes.update(current =>{

            const next = new Map(current);
            const parentMotifNode = next.get(childMotifNode.parentId);
            const updatedChildIds = parentMotifNode?.childIds ?? [];
            updatedChildIds?.push(childMotifNode.id);

            if (parentMotifNode){
                next.set(parentMotifNode.id, {
                    ...parentMotifNode,
                    childIds: updatedChildIds,
                    hasChildren: true
                })
            }

            return next;
        });


    }

    sortChildIds(parentNode: IMotif){

        this.$motifNodes.update(current => {

            const next = new Map(current);
            const childIdsToSort = parentNode?.childIds ?? [];

            //Create array of child motifs
            const children: IMotif[] = [];
            childIdsToSort.forEach(id => {
                const child = next.get(id);
                if (!child){
                    return;
                }
                children.push(child);
            });

            //Sort array by motif code and map IDs 
            children.sort((a, b) => a.motifCode.localeCompare(b.motifCode, undefined, {numeric: true}));
            const sortedChildIds = children.map(child => child.id);

            //Update parent node
            next.set(parentNode.id, {
                ...parentNode,
                childIds: sortedChildIds
            });

            return next;
        });
    }

    sortRootIds(){
        this.$rootIds.update(current => {
            const rootMotifs: IMotif[] = [];

            current.forEach(id => {
                const rootMotif = this.getMotifNode(id);
                if (!rootMotif)
                    return;
                rootMotifs.push(rootMotif);
            });

            rootMotifs.sort((a, b) => a.motifCode.localeCompare(b.motifCode, undefined, {numeric: true}));
            const sortedRootMotifs = rootMotifs.map(rootMotif => rootMotif.id);

            return new Set(sortedRootMotifs);
        });
    }

    postMotifNode(newMotifNode: IMotif){
        this.motifService.postMotif(newMotifNode).subscribe(
            postedMotif => {
                console.log("motif posted: " + postedMotif);
                this.updateMotifNode(postedMotif);

                if (postedMotif.parentId > 0){
                    this.assignChild(postedMotif);
                    const parentNode = this.getMotifNode(postedMotif.parentId);
                    if (!parentNode)
                        return;
                    this.sortChildIds(parentNode);
                    this.expand(postedMotif.parentId);
                }
                else{
                    this.addNewRootMotif(postedMotif);
                }
            }
        );
    }

    putMotifNode(updatedMotifNode: IMotif){
        this.motifService.updateMotif(updatedMotifNode).subscribe(
            updatedMotif => {
                //Retain children after edit. Children are not returned by backend API
                //and field 'hasChildren' is not set until after a following get request.
                //This is a shortcut. 
                const motif = updatedMotif;
                motif.hasChildren = updatedMotifNode.hasChildren;
                motif.childIds = updatedMotifNode.childIds;
                this.updateMotifNode(motif);

                if (motif.parentId > 0){
                    const parentNode = this.getMotifNode(motif.parentId);
                    if (!parentNode)
                        return;
                    this.sortChildIds(parentNode);
                }
                else{
                    this.sortRootIds();
                }
            }
        );
    }

    deleteMotifNode(id: number){

        this.$motifNodes.update(current => {

            const next = new Map(current);

            //Recursively remove children of children, and then child itself
            function removeNode(id: number){
                const node = next.get(id);
                if (!node) return;
                
                if (node.childIds){
                    for (const child of node.childIds){
                        removeNode(child);
                    }
                }

                next.delete(node.id);
            }

            //Remove node from parent
            const node = next.get(id);
            if (!node) return next;
                
            const parentId = node.parentId;

            removeNode(id);

            const nodeParent = next.get(parentId);

            if (nodeParent){
                const updatedParent = {
                    ...nodeParent,
                    childIds: nodeParent.childIds?.filter(childId => childId !== id) ?? []
                }

                if (!updatedParent.childIds?.length){
                    this.collapse(updatedParent.id);
                    updatedParent.hasChildren = false;
                }

                next.set(updatedParent.id, updatedParent);
            }

            return next;
        });

        this.$rootIds().forEach(id => {
            if (!this.$motifNodes().has(id)){
                this.$rootIds().delete(id);
            }
        });

        this.$expandedNodes().forEach(id => {
            if (!this.$motifNodes().has(id)){
                this.$expandedNodes().delete(id);
            }
        });

        this.motifService.deleteMotif(id).subscribe();
    }

    getMotifChildren(id: number){
        this.motifService.getChildren(id).subscribe(children => {
            this.$motifNodes.update(current => {
                const next = new Map(current);

                const sortedChildren = children.sort((a, b) => a.motifCode.localeCompare(b.motifCode));

                for (var child of sortedChildren){
                    next.set(child.id, child);
                }

                const parentMotif = next.get(id);
            
                if (parentMotif){
                    next.set(id, {
                        ...parentMotif,
                        childIds: sortedChildren.map(child => child.id)
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