import { IBib } from "../bib/IBib";

export interface ISagaVersionVm {
  id: number;
  title: string;
  description: string;
  date: number;
  isTranslated: boolean;
  sagaId: number;
  bibDto: IBib[];
  folkloreIds: number[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 