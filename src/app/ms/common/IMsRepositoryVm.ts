export interface IMsRepositoryVm {
  id: number;
  name: string;
  city: string;
  country: string;
  manuscripts: {
    id: number;
    name: string | null;
    shelfmark: string;
  }[];
  accordionOpen: boolean;
}
