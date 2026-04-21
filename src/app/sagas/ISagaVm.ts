import { ISagaVersionVm } from "./ISagaVersionVm";

export interface ISagaVm {
  id: number;
  title: string;
  description: string;
  isTranslated: boolean;
  sagaVersions: ISagaVersionVm[];
}