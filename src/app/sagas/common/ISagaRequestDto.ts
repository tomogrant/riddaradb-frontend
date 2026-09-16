import { IBib } from "../../bib/common/IBib";
import { ISagaMs } from "../../ms/common/ISagaMs";
import { ISagaVersionRequestDto } from "./ISagaVersionRequestDto";

export interface ISagaRequestDto {
  id: number | null;
  title: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionRequestDto[];
  bibIds: number[];
  sagaMsDtos: ISagaMs[];
}
