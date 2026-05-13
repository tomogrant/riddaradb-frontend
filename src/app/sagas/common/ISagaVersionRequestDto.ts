import { SagaDate } from './SagaDate';

export interface ISagaVersionRequestDto {

  id: number;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;
  bibIds: number[];
  folkloreIds: number[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 