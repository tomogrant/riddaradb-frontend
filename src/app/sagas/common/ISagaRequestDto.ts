import { IBib } from "../../bib/common/IBib";
import { ISagaVersionRequestDto } from "./ISagaVersionRequestDto";

export interface ISagaRequestDto {
  id: number | null;
  title: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionRequestDto[];
  bibIds: number[];
}