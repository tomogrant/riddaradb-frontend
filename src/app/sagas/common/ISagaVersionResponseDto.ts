import { IBib } from "../../bib/common/IBib";
import { ISagaMotif } from "./ISagaMotif";
import { SagaDate } from './SagaDate';

export interface ISagaVersionResponseDto {
  id: number;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;
  bibDto: IBib[];
  sagaMotifs: ISagaMotif[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 