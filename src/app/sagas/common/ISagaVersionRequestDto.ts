import { SagaDate } from "./SagaDate";

export interface ISagaVersionRequestDto {
  id: number | null;
  title: string;
  description: string;
  date: SagaDate;
  sagaId: number;
  characterIds: [],
  locationIds: []
}
