export interface IMotif {

    id: number;
    motifCode: string;
    motifName: string;
    description: string;
    parentId: number;
    childIds?: number[];
    hasChildren: boolean;
    sagaVersionIds?: [];

}