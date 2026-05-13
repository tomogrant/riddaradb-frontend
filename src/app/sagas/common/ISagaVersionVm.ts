import { IBibVm } from "../../bib/common/IBibVm";
import { SagaDate } from "./SagaDate";

export interface ISagaVersionVm {
    id: number;
    title: string;
    description: string;
    date: SagaDate;
    isTranslated: boolean;
    sagaId: number;
    bibIds: number[];
    primarySources: IBibVm[];
    secondarySources: IBibVm[];
}