export interface Stock {
  code: string;
  name: string;
  close: string;
  change: string;
  changeRate: string;
  volume: string;
  marketCap: string;
  sector: string;
}

export interface StockData {
  updatedAt: string;
  totalCount: number;
  sectors: Record<string, Stock[]>;
}
