import { IBib } from "../../bib/common/IBib";
import { ISagaMs } from "./ISagaMs";
import { ISagaVersionRequestDto } from "./ISagaVersionRequestDto";

export interface ISagaRequestDto {
  id: number | null;
  title: string;
  translatedTitle: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionRequestDto[];
  bibIds: number[];
  sagaMsDtos: ISagaMs[];
}
