import { IBib } from "../../bib/common/IBib";
import { SagaDate } from './SagaDate';

export interface ISagaVersionResponseDto {
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