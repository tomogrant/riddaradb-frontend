import { IBib } from "../../bib/common/IBib";
import { ISagaMs } from "./ISagaMs";
import { ISagaVersionResponseDto } from "./ISagaVersionResponseDto";

export interface ISagaResponseDto {
  id: number;
  title: string;
  translatedTitle: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionResponseDto[];
  bibDtos: IBib[];
  sagaMsDtos: ISagaMs[];
}
