import { getWBrandCopy, type SupportedLocale, type UiLocale } from "@wbrand/i18n";

export function formatCliHelp(
  version: string,
  locale?: UiLocale,
  detectedLocale?: SupportedLocale,
): string {
  return getWBrandCopy(locale, detectedLocale).cli.help(version);
}
