export interface IMsRepositoryVm {
    id: number;
    name: string;
    manuscripts: {
        id: number,
        name: string | null,
        shelfmark: string
    }[]
    accordionOpen: boolean;
}