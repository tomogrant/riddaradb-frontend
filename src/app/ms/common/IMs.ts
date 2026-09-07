export interface IMs {
    id: number | null;
    name: string;
    shelfmark: string;
    description: string;
    msSaga: {
        sagaId: number;
        folioNumber: string;
    }[];
    msRepositoryId: number
}