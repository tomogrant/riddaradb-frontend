export interface IMotifForm {
    motifCode: string;
    motifName: string;
    description: string;
    sagas: {
        sagaVersionId: number;
        pageChapterNumber: string | null;
    }[]
}