import { ISagaVersionDto } from "./ISagaVersionDto";

export interface ISagaDto {
  id: number;
  title: string;
  description: string;
  translated: boolean;
  sagaVersionIds: number[];
}