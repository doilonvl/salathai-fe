import type { LocalizedString } from "./content";

export interface MarqueeImage {
  id: string;
  imageUrl: string;
  altText: string;
  altText_i18n?: LocalizedString;
  orderIndex: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarqueeSlide {
  id: string;
  tag: string;
  tag_i18n?: LocalizedString;
  text: string;
  text_i18n?: LocalizedString;
  imageUrl: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
