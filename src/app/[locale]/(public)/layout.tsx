import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/request";
import { Toaster } from "@/components/ui/sonner";
import { FooterExplosion } from "@/components/shared/footer";

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // In Next 15+, params is a Promise to enable partial prerendering.
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  setRequestLocale(resolvedLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      {children}
      <FooterExplosion />
      <Toaster />
    </NextIntlClientProvider>
  );
}
