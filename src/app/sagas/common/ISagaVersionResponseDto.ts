
import { ISagaMotif } from './ISagaMotif';
import { SagaDate } from './SagaDate';

export interface ISagaVersionResponseDto {
  id: number;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;  
  sagaMotifs: ISagaMotif[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 