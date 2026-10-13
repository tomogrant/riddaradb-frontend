import { IMsSaga } from "./IMsSaga";

export interface IMs {
  id: number | null;
  name: string | null;
  shelfmark: string;
  date: string;
  entryLink?: string | null;
  description: string | null;
  msSagaDtos: IMsSaga[];
  msRepositoryId: number;
}
