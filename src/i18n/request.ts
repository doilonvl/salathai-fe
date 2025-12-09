/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequestConfig } from "next-intl/server";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

function isLocale(input: string): input is Locale {
  return (locales as readonly string[]).includes(input as any);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Lock default to Vietnamese unless the locale is explicitly provided as "en"
  let locale = (await requestLocale) ?? defaultLocale;
  // if (locale !== "en") locale = defaultLocale;
  if (!isLocale(locale)) locale = defaultLocale;

  const messages = (await import(`@/i18n/message/${locale}.json`)).default;
  return { locale, messages };
});
