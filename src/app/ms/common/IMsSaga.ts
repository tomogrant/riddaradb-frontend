export interface IMsSaga {
  trackingId?: number;
  sagaId: number;
  sagaTitle?: string;
  folioNumber: string;
  note?: string | null;
  selected?: boolean;
}
