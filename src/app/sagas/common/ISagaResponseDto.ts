import { IBib } from "../../bib/common/IBib";
import { ISagaMs } from "../../ms/common/ISagaMs";
import { ISagaVersionResponseDto } from "./ISagaVersionResponseDto";

export interface ISagaResponseDto {
  id: number;
  title: string;
  description: string;
  translated: boolean;
  sagaVersions: ISagaVersionResponseDto[];
  bibDto: IBib[];
  sagaMsDtos: ISagaMs[]
}