export type Locale = "vi" | "en";

export type LocalizedString = {
  vi?: string;
  en?: string;
};

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
