export interface IMotif {

    id: number | null;
    motifCode: string;
    motifName: string;
    description: string;
    parentId: number | null;
    childIds?: number[];
    hasChildren?: boolean;
    sagaMotifs: {
        //Saga version ID is always non-null as motifs can only be attached to existing saga versions.
        sagaVersionId: number;
        pageChapterNumber: string | null;
    }[];

}