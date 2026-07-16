export type StoreDocumentType = "stock_in" | "sale";
export type StoreStockInSource = "purchase" | "production" | "self_supply" | "other";

export type StoreDocumentLineDraft = {
  key: string;
  productId: string;
  quantity: string;
  unitValue: string;
  notes: string;
};

export type StoreDocumentDraft = {
  documentDate: string;
  stockInSource: StoreStockInSource;
  partnerName: string;
  paymentMethod: string;
  notes: string;
  lines: StoreDocumentLineDraft[];
};
