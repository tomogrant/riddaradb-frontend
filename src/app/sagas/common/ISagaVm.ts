import { ISagaVersionResponseDto } from "./ISagaVersionResponseDto";

export interface ISagaVm {
  id: number;
  title: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionResponseDto[];
}