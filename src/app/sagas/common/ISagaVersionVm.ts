import { ISagaMotif } from "./ISagaMotif";
import { SagaDate } from "./SagaDate";

export interface ISagaVersionVm {
    id: number | null;
    title: string;
    description: string;
    date: SagaDate;
    sagaId: number;
    sagaMotifs: ISagaMotif[]
}