export const formatRating = (rating: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);

/** Format the displayed count without changing i18next's numeric plural input. */
export const getLocalizedCountOptions = (count: number, locale: string) => ({
  count,
  replace: { count: new Intl.NumberFormat(locale).format(count) },
});
