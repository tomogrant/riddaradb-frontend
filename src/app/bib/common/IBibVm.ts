import { PublicationType } from "./IBib";

export interface IBibVm{
    id: number;
    publicationType: PublicationType;
    primarySource: boolean;
    recommended: boolean;
    bibliographyEntry: string;
}