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
  MaybeRTF,
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

const typographyStyles = `
.yext-family-destination-events p,
.yext-family-destination-events li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-events h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-events h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-events h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-events h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-events h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-events h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-events) a {
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

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const createStringField = (
  value: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue: value,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createRichTextField = (
  value: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(value),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

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

const createButtonCta = (label: string): AuthoredComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: label,
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
    link: {
      fontFamily: "default",
      fontSize: "default",
      fontWeight: "700",
      fontStyle: "default",
      textTransform: "default",
      letterSpacing: "default",
      includeCaret: "none",
    },
  },
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

const hasImageSource = (
  image: unknown,
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string" && image.url.trim()) {
    return true;
  }

  return Boolean(
    "image" in image &&
    image.image &&
    typeof image.image === "object" &&
    "url" in image.image &&
    typeof image.image.url === "string" &&
    image.image.url.trim(),
  );
};

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
    ? resolveComponentData(props.description.text, locale, streamDocument, {
        richTextStyleOverrides: {
          ...props.description.styles,
          color:
            getThemeColorCssValue(props.description?.fontColor) ??
            "currentColor",
        },
      })
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
                  {React.isValidElement(description) ? (
                    description
                  ) : typeof description === "string" ||
                    (description &&
                      typeof description === "object" &&
                      "html" in description) ? (
                    <MaybeRTF data={description as string | { html: string }} />
                  ) : null}
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
    fields: toPuckFields(fields),
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
