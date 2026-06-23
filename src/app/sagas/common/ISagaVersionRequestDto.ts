import { SagaDate } from './SagaDate';

export interface ISagaVersionRequestDto {
  id: number | null;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 