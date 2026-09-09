import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  Background,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
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
import {
  createRichTextField as createRichTextFieldDefault,
  createTextField as createStringFieldDefault,
} from "../shared/sectionDefaults";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  renderRichText,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-faq");

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


const defaultSharedTextStyle: SharedTextStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};

const defaultSharedRtfStyle: SharedRtfStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};



const createHeadingDefault = (defaultValue: string): StyledTextProps => ({
  text: createStringFieldDefault(defaultValue),
  styles: defaultTextStyles,
  fontColor: undefined,
});



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
  const question = item.question
    ? resolveComponentData(item.question, locale)
    : "";
  const answer = item.answer
    ? resolveComponentData(item.answer, locale, streamDocument)
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
          {renderRichText(answer, {
            ...styles.answer.styles,
            color: getThemeColorCssValue(styles.answer?.fontColor) ?? textColor,
          })}
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
    fields: toPuckFields<FamilyDestinationFaqProps>(fields),
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
