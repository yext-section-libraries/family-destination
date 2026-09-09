import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  resolveComponentData,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
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
  defaultTextStyles,
  getScopedTypographyCss,
  renderRichText,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";
import { hasImageSource } from "../shared/imageUtils";

const typographyStyles = getScopedTypographyCss(
  "yext-family-destination-about",
);

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ImageField = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  imageConstrain: "fixed" | "filled";
};

export type FamilyDestinationAboutProps = {
  heading: StyledTextProps;
  description: StyledRtfProps;
  cta: ComprehensiveCTAValue;
  image: ImageField;
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};



const fields: YextFields<FamilyDestinationAboutProps> = {
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
  description: {
    label: "Description",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.rich_text_v2"] },
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
  cta: {
    label: "Call to Action",
    type: "comprehensiveCTA",
    showIncludeCaretField: false,
  },
  image: {
    label: "Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
    },
  },
};

const Component: PuckComponent<FamilyDestinationAboutProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedImage = resolveComponentData(
    props.image.image,
    locale,
    streamDocument,
  );
  const hasSectionImage = hasImageSource(resolvedImage);
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionDefaultForeground = sectionStyle?.color ?? "currentColor";
  const headingForeground =
    getThemeColorCssValue(props.heading?.fontColor) ?? sectionDefaultForeground;
  const resolvedDescription = resolveComponentData(
    props.description.text,
    locale,
    streamDocument,
  );
  const ctaValue: Partial<ComprehensiveCTAValue> = {
    data: props.cta.data,
    styles: props.cta.styles,
    className: props.cta.className,
    eventName: props.cta.eventName,
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationAbout${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          className={`yext-family-destination-about grid grid-cols-1 ${
            hasSectionImage ? "lg:grid-cols-2" : ""
          }`}
        >
          <style>{typographyStyles}</style>
          <Background
            as="div"
            background={props.section.backgroundColor}
            className="flex flex-col gap-10 px-5 py-10 lg:px-12 lg:py-20"
            style={sectionStyle}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="m-0  leading-[26.4px]"
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
            <div className="flex flex-col items-start gap-5">
              <EntityField
                displayName="Description"
                fieldId={props.description.text.field}
                constantValueEnabled={
                  props.description.text.constantValueEnabled
                }
              >
                <div
                  className="m-0 leading-[30px] tracking-[0.25px]"
                  style={{
                    ...resolveStyledTextStyles(
                      props.description.styles,
                      props.description?.fontColor,
                      sectionDefaultForeground,
                      "var(--fontFamily-body-fontFamily)",
                      "var(--fontSize-body-fontSize)",
                      "var(--fontWeight-body-fontWeight)",
                    ),
                    lineHeight: "30px",
                    letterSpacing: "0.25px",
                  }}
                >
                  {renderRichText(resolvedDescription)}
                </div>
              </EntityField>
              <EntityField
                displayName="Call to Action"
                fieldId={props.cta.data.cta.field}
                constantValueEnabled={props.cta.data.cta.constantValueEnabled}
              >
                <ComprehensiveCTA
                  value={ctaValue}
                  eventName="cta"
                  className={
                    props.cta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-max max-w-full items-center self-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-secondary)] focus-visible:text-[var(--colors-palette-secondary)]"
                      : undefined
                  }
                />
              </EntityField>
            </div>
          </Background>
          {hasSectionImage ? (
            <figure className="relative m-0 h-80 overflow-hidden sm:h-[500px] lg:h-auto lg:self-stretch">
              <EntityField
                displayName="Image"
                fieldId={props.image.image.field}
                constantValueEnabled={props.image.image.constantValueEnabled}
                fullHeight
              >
                <Image
                  image={resolvedImage}
                  className="h-full w-full lg:absolute lg:inset-0"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit:
                      props.image.imageConstrain === "filled"
                        ? "cover"
                        : "contain",
                  }}
                />
              </EntityField>
            </figure>
          ) : null}
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationAbout: YextComponentConfig<FamilyDestinationAboutProps> =
  {
    label: "About",
    fields: toPuckFields<FamilyDestinationAboutProps>(fields),
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "About This Hotel",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "[[name]] is located at [[address.line1]], serving as the perfect launchpad for exploring [[address.city]]'s rich history and vibrant culture. Our boutique property offers an elevated stay, seamlessly combining historic architecture with high-tech guest convenience. The hotel features beautifully restored architectural details, an expansive art collection highlighting local creators, a quiet library lounge for remote work, and contactless digital key entry to save you time.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Book A Room",
                hasLocalizedValue: "true",
              },
              link: { defaultValue: "#", hasLocalizedValue: "true" },
              linkType: "URL",
              ctaType: "textAndLink",
            },
            constantValueEnabled: true,
            selectedType: "textAndLink",
          },
          openInNewTab: false,
        },
        styles: {
          variant: "primary",
          color: {
            selectedColor: "white",
            contrastingColor: "palette-primary",
          },
          button: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            borderRadius: "default",
            letterSpacing: "default",
          },
          link: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            letterSpacing: "default",
            includeCaret: "none",
          },
        },
      },
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
            width: 1267,
            height: 1900,
          },
          constantValueEnabled: true,
        },
        imageConstrain: "filled",
      },
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: (props) => <Component {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationAbout",
  displayName: "About",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
