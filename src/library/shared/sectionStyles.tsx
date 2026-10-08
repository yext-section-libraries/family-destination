import * as React from "react";
import {
  MaybeRTF,
  getThemeColorCssValue,
  normalizeThemeColorToken,
  renderStyledRichText,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

export const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const isRichText = (value: unknown): value is RichText =>
  Boolean(
    value &&
    typeof value === "object" &&
    (("html" in value && typeof value.html === "string") ||
      ("json" in value && typeof value.json === "string")),
  );

export const renderRichText = (
  value: unknown,
  text: StyledTextValue,
  className?: string,
): React.ReactNode => {
  const content = isRichText(value) ? (
    <MaybeRTF data={value} />
  ) : React.isValidElement(value) || typeof value === "string" ? (
    value
  ) : null;

  const rendered = renderStyledRichText({ content, text, className });
  if (!React.isValidElement<{ className?: string }>(rendered)) {
    return rendered;
  }

  // A new .components scope resets these variables to !important editor theme
  // defaults. Inherit the section's theme so the selected typography can apply.
  return React.cloneElement(rendered, {
    className: rendered.props.className
      ?.split(/\s+/)
      .filter((name) => name !== "components")
      .join(" "),
  });
};

/** Use the selected text color, otherwise the section's contrasting color. */
export const resolveTextColor = (
  styles: Pick<StyledTextValue, "color">,
  fallbackColor?: ThemeColor | string,
): ThemeColor | undefined => {
  if (normalizeThemeColorToken(styles.color)) {
    return styles.color;
  }
  const fallbackToken = normalizeThemeColorToken(fallbackColor);
  return fallbackToken
    ? typeof fallbackColor === "string"
      ? { selectedColor: fallbackToken, contrastingColor: "default" }
      : fallbackColor
    : undefined;
};

export const resolveRichTextStyles = (
  styles: StyledTextValue,
  fallbackColor?: ThemeColor | string,
): StyledTextValue => ({
  ...styles,
  color: resolveTextColor(styles, fallbackColor),
});

export const resolveStyledTextStyles = (
  styles: StyledTextValue,
  fallbackColor: string,
  fallbackFontFamily: string,
  fallbackFontSize: string,
  fallbackFontWeight: React.CSSProperties["fontWeight"],
  fallbackTextTransform?: React.CSSProperties["textTransform"],
): React.CSSProperties => ({
  color: getThemeColorCssValue(resolveTextColor(styles)) ?? fallbackColor,
  fontFamily:
    styles.fontFamily === "default" ? fallbackFontFamily : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? fallbackFontSize : styles.fontSize,
  fontWeight:
    styles.fontWeight === "default" ? fallbackFontWeight : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default"
      ? fallbackTextTransform
      : styles.textTransform,
});

export const getScopedTypographyCss = (scopeClass: string): string => `
.${scopeClass} p,
.${scopeClass} li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
${[1, 2, 3, 4, 5, 6]
  .map(
    (level) => `.${scopeClass} h${level} {
  font-family: var(--fontFamily-h${level}-fontFamily);
  font-size: var(--fontSize-h${level}-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h${level}-fontWeight);
  font-style: var(--fontStyle-h${level}-fontStyle);
  text-transform: var(--textTransform-h${level}-textTransform);
}`,
  )
  .join("\n")}
:where(.${scopeClass}) a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
`;
