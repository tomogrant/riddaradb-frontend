import { IMsSaga } from "./IMsSaga";

export interface IMs {
    id: number | null;
    name: string | null;
    shelfmark: string;
    description: string | null;
    msSagaDtos: IMsSaga[];
    msRepositoryId: number
}