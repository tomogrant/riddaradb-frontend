export interface IBib {
  id: number;
  authors: string;
  title: string;
  editors: string;
  book: string;
  bookSeries: string;
  numOfVolumes: number;
  placeOfPublication: string;
  publisher: string;
  publicationYear: string;
  pageNumbers: string;
  sagaIds: number[];
}