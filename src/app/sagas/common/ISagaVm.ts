import { IBibVm } from "../../bib/common/IBibVm";
import { ISagaMs } from "../../ms/common/ISagaMs";
import { ISagaVersionVm } from "./ISagaVersionVm";

export interface ISagaVm{
    id: number | null,
    title: string,
    description: string,
    translated: boolean,
    sagaVersions: ISagaVersionVm[],
    bibIds: number[];
    primarySources: IBibVm[];
    secondarySources: IBibVm[];
    manuscripts: ISagaMs[];
}