import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  Background,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  MaybeRTF,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

const typographyStyles = `
.yext-family-destination-faq p,
.yext-family-destination-faq li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-faq h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-faq h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-faq h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-faq h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-faq h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-faq h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-faq) a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
`;

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedRtfStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type FaqItemProps = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

type FaqStyles = {
  question: SharedTextStyleProps;
  answer: SharedRtfStyleProps;
};

type ResolvedFaqItem = ReturnType<typeof faqItemsSource.resolveItems>[number];

export type FamilyDestinationFaqProps = {
  heading: StyledTextProps;
  items: {
    data: Parameters<typeof faqItemsSource.resolveItems>[0];
    styles: FaqStyles;
  };
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultSharedTextStyle: SharedTextStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};

const defaultSharedRtfStyle: SharedRtfStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};

const createStringFieldDefault = (
  defaultValue: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createRichTextFieldDefault = (
  defaultValue: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(defaultValue),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createHeadingDefault = (defaultValue: string): StyledTextProps => ({
  text: createStringFieldDefault(defaultValue),
  styles: defaultTextStyles,
  fontColor: undefined,
});

const resolveStyledTextStyles = (
  styles: StyledTextValue,
  fontColor: ThemeColor | undefined,
  fallbackColor: string,
  fallbackFontFamily: string,
  fallbackFontSize: string,
  fallbackFontWeight: React.CSSProperties["fontWeight"],
) => ({
  color: getThemeColorCssValue(fontColor) ?? fallbackColor,
  fontFamily:
    styles.fontFamily === "default" ? fallbackFontFamily : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? fallbackFontSize : styles.fontSize,
  fontWeight:
    styles.fontWeight === "default" ? fallbackFontWeight : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const resolveTranslatableString = (
  value: TranslatableString | undefined,
  locale: string,
) => {
  if (typeof value === "string") {
    return value;
  }

  if (!value) {
    return "";
  }

  return value[locale] ?? value.defaultValue ?? "";
};

const faqItemsSource = createItemSource<FaqItemProps>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: { types: ["type.string"] },
    },
    answer: {
      type: "entityField",
      label: "Answer",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
  defaultValues: [
    {
      question: createStringFieldDefault(
        "What is the cancellation policy at [[name]]?",
      ),
      answer: createRichTextFieldDefault(
        "We offer free cancellation up to 48 hours prior to your scheduled arrival date for all direct bookings made through our website or reservation desk.",
      ),
    },
    {
      question: createStringFieldDefault(
        "Is parking available on-site, and what is the cost?",
      ),
      answer: createRichTextFieldDefault(
        "Valet parking is available 24/7. Self-parking options may be available nearby; please contact the front desk for current rates and availability.",
      ),
    },
    {
      question: createStringFieldDefault("Does [[name]] allow pets?"),
      answer: createRichTextFieldDefault(
        "We welcome well-behaved pets in select pet-friendly rooms. A nightly pet fee applies. Please notify us at booking so we can prepare your room.",
      ),
    },
    {
      question: createStringFieldDefault("Do you offer an airport shuttle?"),
      answer: createRichTextFieldDefault(
        "We can arrange private airport transfers through our concierge team. Shared shuttle schedules vary by season; inquire at check-in for details.",
      ),
    },
    {
      question: createStringFieldDefault(
        "Can I request an early check-in or late check-out?",
      ),
      answer: createRichTextFieldDefault(
        "Early check-in and late check-out are subject to availability. Contact the front desk on your arrival day and we will do our best to accommodate your request.",
      ),
    },
  ],
});

const fields: YextFields<FamilyDestinationFaqProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  items: {
    label: "FAQ Items",
    type: "object",
    objectFields: {
      data: faqItemsSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          question: {
            label: "Question",
            type: "object",
            objectFields: {
              styles: {
                label: "Text Styles",
                type: "styledText",
              },
              fontColor: {
                label: "Font Color",
                type: "basicSelector",
                options: "SITE_COLOR",
              },
            },
          },
          answer: {
            label: "Answer",
            type: "object",
            objectFields: {
              styles: {
                label: "Text Styles",
                type: "styledText",
              },
              fontColor: {
                label: "Font Color",
                type: "basicSelector",
                options: "SITE_COLOR",
              },
            },
          },
        },
      },
    },
  },
};

const FaqRow = ({
  item,
  index,
  styles,
  textColor,
  dividerColor,
  locale,
  streamDocument,
}: {
  item: ResolvedFaqItem;
  index: number;
  styles: FaqStyles;
  textColor: string;
  dividerColor: string;
  locale: string;
  streamDocument: Record<string, any>;
}) => {
  const analytics = useAnalytics();
  const question = resolveTranslatableString(item.question, locale);
  const answer = item.answer
    ? resolveComponentData(item.answer, locale, streamDocument, {
        richTextStyleOverrides: {
          ...styles.answer.styles,
          color: getThemeColorCssValue(styles.answer?.fontColor) ?? textColor,
        },
      })
    : null;

  return (
    <div className="flex flex-col gap-3.5">
      <details
        className="group flex flex-col gap-3.5"
        onToggle={(event) => {
          analytics?.track({
            action: (event.currentTarget as HTMLDetailsElement).open
              ? "EXPAND"
              : "COLLAPSE",
            eventName: `toggle-${index}`,
          });
        }}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-2.5 marker:hidden"
          style={resolveStyledTextStyles(
            styles.question.styles,
            styles.question?.fontColor,
            textColor,
            "var(--fontFamily-body-fontFamily)",
            "var(--fontSize-body-fontSize)",
            "var(--fontWeight-body-fontWeight)",
          )}
        >
          {question}
          <span className="text-base transition group-open:rotate-180">⌄</span>
        </summary>
        <div
          style={{
            ...resolveStyledTextStyles(
              styles.answer.styles,
              styles.answer?.fontColor,
              textColor,
              "var(--fontFamily-body-fontFamily)",
              "var(--fontSize-body-fontSize)",
              "var(--fontWeight-body-fontWeight)",
            ),
            lineHeight: "22px",
          }}
        >
          {React.isValidElement(answer) ? (
            answer
          ) : typeof answer === "string" ||
            (answer && typeof answer === "object" && "html" in answer) ? (
            <MaybeRTF data={answer as string | { html: string }} />
          ) : null}
        </div>
      </details>
      <hr
        className="m-0 border-0 border-t"
        style={{ borderColor: dividerColor }}
      />
    </div>
  );
};

const Component: PuckComponent<FamilyDestinationFaqProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const items = faqItemsSource.resolveItems(props.items.data, streamDocument);
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionDefaultForeground = sectionStyle?.color ?? "currentColor";
  const dividerColor = sectionDefaultForeground;
  const headingForeground =
    getThemeColorCssValue(props.heading?.fontColor) ?? sectionDefaultForeground;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationFaq${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-faq flex flex-col items-start gap-10 px-5 py-10 lg:items-center lg:gap-8 lg:px-12 lg:py-20"
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          <EntityField
            displayName="Heading"
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2
              className="m-0 w-full lg:text-center"
              style={resolveStyledTextStyles(
                props.heading.styles,
                props.heading?.fontColor,
                headingForeground,
                "var(--fontFamily-h2-fontFamily)",
                "var(--fontSize-h2-fontSize)",
                "var(--fontWeight-h2-fontWeight)",
              )}
            >
              {heading}
            </h2>
          </EntityField>
          <div className="flex w-full max-w-[900px] flex-col gap-8">
            <EntityField
              displayName="Frequently Asked Questions"
              fieldId={props.items.data?.field}
              constantValueEnabled={props.items.data?.constantValueEnabled}
              className="flex flex-col gap-8"
            >
              {items.map((item, index) => (
                <FaqRow
                  key={`${index}`}
                  item={item}
                  index={index}
                  styles={props.items.styles}
                  textColor={sectionDefaultForeground}
                  dividerColor={dividerColor}
                  locale={locale}
                  streamDocument={streamDocument}
                />
              ))}
            </EntityField>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationFaq: YextComponentConfig<FamilyDestinationFaqProps> =
  {
    label: "Faq",
    fields: toPuckFields(fields),
    defaultProps: {
      heading: createHeadingDefault("Frequently Asked Questions"),
      items: {
        data: faqItemsSource.defaultValue,
        styles: {
          question: defaultSharedTextStyle,
          answer: defaultSharedRtfStyle,
        },
      },
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
    },
    render: (props) => <Component {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationFaq",
  displayName: "Faq",
  description: "Faq",
  pageSetTypes: ["ENTITY"],
};
