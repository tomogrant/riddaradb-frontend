import { PublicationType } from "./IBib";

export interface IBibVm{
    id: number;
    publicationType: PublicationType;
    bibliographyEntry: string;
}