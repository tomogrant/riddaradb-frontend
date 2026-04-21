export interface ISagaVersionDto {
  id: number;
  title: string;
  description: string;
  date: number;
  isTranslated: boolean;
  sagaId: number;
  bibIds: number[];
  folkloreIds: number[];
  personIds: number[];
  placeIds: number[];
  objectIds: number[];
  msIds: number[];
} 