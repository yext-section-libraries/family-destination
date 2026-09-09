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
  createCta,
  createRichTextField,
  createTextField as createStringField,
} from "../shared/sectionDefaults";
import { hasImageSource } from "../shared/imageUtils";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  renderRichText,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-events");

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type RichTextProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ImageField = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

type AuthoredComprehensiveCTAValue = Omit<ComprehensiveCTAValue, "sx"> & {
  sx?: Record<string, unknown>;
};

export type FamilyDestinationEventsProps = {
  heading: StyledTextProps;
  description: RichTextProps;
  cta: AuthoredComprehensiveCTAValue;
  image: ImageField;
  section: {
    visibleOnLivePage: boolean;
    panelBackgroundColor: ThemeColor;
  };
};




const createHeadingDefault = (value: string): StyledTextProps => ({
  text: createStringField(value),
  styles: defaultTextStyles,
  fontColor: undefined,
});

const createDescriptionDefault = (value: string): RichTextProps => ({
  text: createRichTextField(value),
  styles: defaultTextStyles,
  fontColor: undefined,
});

const createButtonCta = (label: string): AuthoredComprehensiveCTAValue =>
  createCta({
    label,
    variant: "primary",
    color: { selectedColor: "white", contrastingColor: "palette-primary" },
    includeCaret: "none",
    linkFontWeight: "700",
  });



const fields: YextFields<FamilyDestinationEventsProps> = {
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
      panelBackgroundColor: {
        label: "Panel Background Color",
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
    label: "Call To Action",
    type: "comprehensiveCTA",
    showIncludeCaretField: false,
  },
  image: {
    label: "Background Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
      },
    },
  },
};

const Component: PuckComponent<FamilyDestinationEventsProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const image = resolveComponentData(props.image.image, locale, streamDocument);
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const description = props.description.text
    ? resolveComponentData(props.description.text, locale, streamDocument)
    : null;
  const panelStyle =
    getSurfaceColorStyle(props.section.panelBackgroundColor, streamDocument) ??
    {};
  const panelForeground = panelStyle.color ?? "currentColor";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationEvents${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={{ selectedColor: "white", contrastingColor: "black" }}
          className="yext-family-destination-events relative flex min-h-[420px] flex-col items-stretch overflow-hidden px-5 py-10 lg:items-end lg:justify-center lg:px-12 lg:py-20"
        >
          <style>{typographyStyles}</style>
          {hasImageSource(image) ? (
            <EntityField
              displayName="Background Image"
              fieldId={props.image.image.field}
              constantValueEnabled={props.image.image.constantValueEnabled}
              fullHeight
              className="absolute inset-0 z-0"
            >
              <Image
                image={image}
                className="h-full w-full object-cover object-[50%_80%]"
              />
            </EntityField>
          ) : null}
          <Background
            as="div"
            background={props.section.panelBackgroundColor}
            className="relative z-[1] flex w-full max-w-[700px] flex-col gap-10 p-5 backdrop-blur lg:gap-8"
            style={panelStyle}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="m-0"
                style={resolveStyledTextStyles(
                  props.heading.styles,
                  props.heading?.fontColor,
                  panelForeground,
                  "var(--fontFamily-h2-fontFamily)",
                  "var(--fontSize-h2-fontSize)",
                  "var(--fontWeight-h2-fontWeight)",
                )}
              >
                {heading}
              </h2>
            </EntityField>
            <div className="flex flex-col gap-5">
              <EntityField
                displayName="Description"
                fieldId={props.description.text.field}
                constantValueEnabled={
                  props.description.text.constantValueEnabled
                }
              >
                <div
                  style={{
                    ...resolveStyledTextStyles(
                      props.description.styles,
                      props.description?.fontColor,
                      panelForeground,
                      "var(--fontFamily-body-fontFamily)",
                      "var(--fontSize-body-fontSize)",
                      "var(--fontWeight-body-fontWeight)",
                    ),
                    lineHeight: "30px",
                    letterSpacing: "0.25px",
                  }}
                >
                  {renderRichText(description, {
                    ...props.description.styles,
                    color:
                      getThemeColorCssValue(props.description?.fontColor) ??
                      "currentColor",
                  })}
                </div>
              </EntityField>
              <EntityField
                displayName="Call to Action"
                fieldId={props.cta.data.cta.field}
                constantValueEnabled={props.cta.data.cta.constantValueEnabled}
              >
                <ComprehensiveCTA
                  value={{
                    data: props.cta.data,
                    styles: props.cta.styles,
                    className: props.cta.className,
                    eventName: props.cta.eventName,
                  }}
                  eventName="cta"
                  className={
                    props.cta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-max max-w-full items-center self-start justify-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-secondary)] focus-visible:text-[var(--colors-palette-secondary)]"
                      : "justify-center lg:justify-start"
                  }
                />
              </EntityField>
            </div>
          </Background>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationEvents: YextComponentConfig<FamilyDestinationEventsProps> =
  {
    label: "Events",
    fields: toPuckFields<FamilyDestinationEventsProps>(fields),
    defaultProps: {
      heading: createHeadingDefault("Special Events & Celebrations"),
      description: createDescriptionDefault(
        "Host your next unforgettable milestone at [[name]]. From romantic courtyard weddings and elegant proms to upscale corporate galas, our historic venue provides a breathtaking backdrop paired with full-service event planning, customizable floor plans, state-of-the-art audiovisual setups, and bespoke catering menus crafted by our executive chef.",
      ),
      cta: createButtonCta("Contact Us"),
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
      },
      section: {
        visibleOnLivePage: true,
        panelBackgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: (props) => <Component {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationEvents",
  displayName: "Events",
  description: "Events",
  pageSetTypes: ["ENTITY"],
};
