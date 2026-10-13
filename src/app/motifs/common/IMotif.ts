import { IMotifSaga } from "./IMotifSaga";

export interface IMotif {
  id: number | null;
  motifCode: string;
  motifName: string;
  description: string;
  parentId: number | null;
  childIds?: number[];
  hasChildren?: boolean;
  motifSagas: IMotifSaga[];
}
