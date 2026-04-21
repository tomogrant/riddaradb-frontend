import { ISagaVersionDto } from "./ISagaVersionDto";

export interface ISagaDto {
  id: number;
  title: string;
  description: string;
  isTranslated: boolean;
  sagaVersionIds: number[];
}