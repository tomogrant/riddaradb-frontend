import { IBib } from "../../bib/IBib";
import { SagaDate } from './SagaDate';

export interface ISagaVersionVm {
  id: number;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;
  bibDto: IBib[];
  folkloreIds: number[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 