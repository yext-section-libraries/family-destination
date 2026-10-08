import assert from "node:assert/strict";
import { test } from "node:test";
import { createInstance } from "i18next";
import {
  formatRating,
  getLocalizedCountOptions,
} from "../src/library/shared/localization";

test("ratings use the locale's decimal separator", async (t) => {
  for (const { locale, rating, expected } of [
    { locale: "en", rating: 4.5, expected: "4.5" },
    { locale: "fr", rating: 4.5, expected: "4,5" },
    { locale: "de", rating: 4, expected: "4,0" },
  ]) {
    await t.test(`${locale}: ${rating}`, () => {
      assert.equal(formatRating(rating, locale), expected);
    });
  }
});

test("localized count display preserves numeric plural selection", async (t) => {
  for (const locale of ["en", "fr", "de"]) {
    await t.test(locale, async () => {
      const i18n = createInstance();
      await i18n.init({
        lng: locale,
        resources: {
          [locale]: {
            translation: {
              reviews_one: "{{count}} review",
              reviews_other: "{{count}} reviews",
            },
          },
        },
      });
      for (const count of [0, 1, 2, 12345]) {
        const options = getLocalizedCountOptions(count, locale);
        assert.equal(options.count, count, "plural selection receives a number");
        const category = new Intl.PluralRules(locale).select(count);
        const unit = category === "one" ? "review" : "reviews";
        assert.equal(
          i18n.t("reviews", options),
          `${new Intl.NumberFormat(locale).format(count)} ${unit}`,
        );
      }
    });
  }
});
