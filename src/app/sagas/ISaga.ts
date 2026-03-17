export interface ISaga {
  id: number;
  name: string;
  description: string;
  date: string;
  isTranslated: boolean;
  bibIds: number[];
  folkloreIds: number[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
}