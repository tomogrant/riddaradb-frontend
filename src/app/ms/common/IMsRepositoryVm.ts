export interface IMsRepositoryVm {
    id: number;
    name: string;
    manuscripts: {
        id: number,
        name: string | undefined,
        shelfmark: string
    }[]
    accordionOpen: boolean;
}