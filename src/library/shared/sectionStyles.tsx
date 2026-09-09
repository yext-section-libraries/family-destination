import * as React from "react";
import {
  getThemeColorCssValue,
  MaybeRTF,
  type MaybeRTFProps,
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

export const resolveStyledTextStyles = (
  styles: StyledTextValue | undefined,
  fontColor: ThemeColor | undefined,
  fallbackColor: string,
  fallbackFontFamily: string,
  fallbackFontSize: string,
  fallbackFontWeight: React.CSSProperties["fontWeight"],
): React.CSSProperties => ({
  color: getThemeColorCssValue(fontColor) ?? fallbackColor,
  fontFamily:
    !styles?.fontFamily || styles.fontFamily === "default"
      ? fallbackFontFamily
      : styles.fontFamily,
  fontSize:
    !styles?.fontSize || styles.fontSize === "default"
      ? fallbackFontSize
      : styles.fontSize,
  fontWeight:
    !styles?.fontWeight || styles.fontWeight === "default"
      ? fallbackFontWeight
      : styles.fontWeight,
  fontStyle:
    !styles?.fontStyle || styles.fontStyle === "default"
      ? undefined
      : styles.fontStyle,
  textTransform:
    !styles?.textTransform || styles.textTransform === "default"
      ? undefined
      : styles.textTransform,
});

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    return value;
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

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
