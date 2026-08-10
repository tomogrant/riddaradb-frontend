import { Injectable, signal } from "@angular/core";
import { Mode } from "../../shared/Enums";

@Injectable({
  providedIn: 'root'
})

export class MotifModalService {

    $modalState = signal(<ModalState | null>(null));

    openAddModal(motifId?: number){
        this.$modalState.set({
            mode: Mode.ADD,
            motifId
        });
    }

    openEditModal(motifId?: number){
        this.$modalState.set({
            mode: Mode.EDIT,
            motifId
        });
    }

    openDeleteModal(motifId?: number){
        this.$modalState.set({
            mode: Mode.DELETE,
            motifId
        });
    }

    closeModal(){
        this.$modalState.set(null);
    }
}

export interface ModalState{
    mode: Mode;
    motifId?: number;
    parentId?: number;
}