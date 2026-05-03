export interface IBib {
  id: number;
  publicationType: PublicationType;
  authors: string;
  editors: string;
  translators: string;
  title: string;
  url: string;
  bookEditors: string;
  book: string;
  bookSeries: string;
  volume: string;
  numOfVolumes: string;
  placeOfPublication: string;
  publisher: string;
  publicationYear: string;
  pageNumbers: string;
  sagaVersionIds: number[];
  recommended: boolean;
}

export enum PublicationType{
  UNDEFINED = "UNDEFINED",
  JOURNAL_ARTICLE = "JOURNAL_ARTICLE",
  BOOK_CHAPTER = "BOOK_CHAPTER",
  EDITION = "EDITION",
  TRANSLATION = "TRANSLATION",
  MONOGRAPH = "MONOGRAPH",
  EDITED_COLLECTION = "EDITED_COLLECTION",
  THESIS = "THESIS",
  WEBSITE = "WEBSITE",
  OTHER = "OTHER"
}