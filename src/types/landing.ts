import type { LocalizedString } from "./content";

export interface LandingMenuItem {
  id: string;
  imageUrl: string;
  altText: string;
  altText_i18n?: LocalizedString;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
