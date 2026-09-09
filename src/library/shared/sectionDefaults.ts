import {
  getDefaultRTF,
  type ComprehensiveCTAValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

export const createTextField = (
  defaultValue: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

export const createRichTextField = (
  defaultValue: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(defaultValue),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

type CreateCtaOptions = {
  label: string;
  link?: string;
  variant: "primary" | "secondary" | "link";
  color?: ThemeColor;
  includeCaret?: string;
  linkFontWeight?: string;
};

export const createCta = ({
  label,
  link = "#",
  variant,
  color,
  includeCaret = "default",
  linkFontWeight = "default",
}: CreateCtaOptions): Omit<ComprehensiveCTAValue, "sx"> => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label: { defaultValue: label, hasLocalizedValue: "true" },
        link: { defaultValue: link, hasLocalizedValue: "true" },
        linkType: "URL",
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
  },
  styles: {
    variant,
    ...(color ? { color } : {}),
    link: {
      fontFamily: "default",
      fontSize: "default",
      fontWeight: linkFontWeight,
      fontStyle: "default",
      textTransform: "default",
      letterSpacing: "default",
      includeCaret,
    },
  },
});
