import { IMsSaga } from "./IMsSaga";

export interface IMs {
  id: number | null;
  name: string | null;
  shelfmark: string;
  date?: string | null;
  handritLink?: string | null;
  fasnlLink?: string | null;
  description: string | null;
  msSagaDtos: IMsSaga[];
  msRepositoryId: number;
}
