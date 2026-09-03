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
  getAggregateRating,
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
.yext-family-destination-hero p,
.yext-family-destination-hero li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-hero h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-hero h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-hero h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-hero h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-hero h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-hero h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-hero) a {
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

type StyledRichTextProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ImageField = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  imageConstrain: "fixed" | "filled";
};

export type FamilyDestinationHeroProps = {
  eyebrow: StyledTextProps;
  heading: StyledTextProps;
  body: StyledRichTextProps;
  badge: StyledTextProps;
  image: ImageField;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    badgeBackgroundColor: ThemeColor;
  };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

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

const fields: YextFields<FamilyDestinationHeroProps> = {
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
      badgeBackgroundColor: {
        label: "Badge Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  eyebrow: {
    label: "Eyebrow",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
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
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: "Body",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.rich_text_v2"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  badge: {
    label: "Badge",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  image: {
    label: "Hero Image",
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
  primaryCta: {
    label: "Primary Call to Action",
    type: "comprehensiveCTA",
    showIncludeCaretField: false,
  },
  secondaryCta: {
    label: "Secondary Call to Action",
    type: "comprehensiveCTA",
    showIncludeCaretField: false,
  },
};

const StarRow = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="text-[1em] leading-none">
        {rating >= index + 1 ? "★" : rating > index ? "★" : "☆"}
      </span>
    ))}
  </span>
);

const HeroComponent: PuckComponent<FamilyDestinationHeroProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const image = resolveComponentData(props.image.image, locale, streamDocument);
  const hasHeroImage = hasImageSource(image);
  const eyebrow =
    resolveComponentData(props.eyebrow.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const badge =
    resolveComponentData(props.badge.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const rating =
    typeof averageRating === "number"
      ? averageRating
      : props.puck.isEditing
        ? 4.8
        : undefined;
  const count =
    typeof reviewCount === "number" && reviewCount > 0
      ? reviewCount
      : props.puck.isEditing
        ? 1248
        : undefined;
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const panelStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const badgeStyle = getSurfaceColorStyle(
    props.section.badgeBackgroundColor,
    streamDocument,
  );
  const panelForeground = panelStyle?.color ?? "currentColor";
  const badgeForeground = badgeStyle?.color ?? "currentColor";
  const body = resolveComponentData(props.body.text, locale, streamDocument, {
    richTextStyleOverrides: {
      ...props.body.styles,
      color: getThemeColorCssValue(props.body?.fontColor) ?? panelForeground,
    },
  });
  const bodyTextStyle = resolveStyledTextStyles(
    props.body.styles,
    props.body?.fontColor,
    panelForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const primaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: props.primaryCta.data,
    styles: props.primaryCta.styles,
    className: props.primaryCta.className,
    eventName: props.primaryCta.eventName,
  };
  const secondaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: props.secondaryCta.data,
    styles: props.secondaryCta.styles,
    className: props.secondaryCta.className,
    eventName: props.secondaryCta.eventName,
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationHero${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className={`yext-family-destination-hero flex flex-col ${
            hasHeroImage ? "lg:flex-row" : ""
          }`}
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          {hasHeroImage ? (
            <div className="h-[327px] w-full sm:h-[724px] lg:h-auto lg:min-h-[852px] lg:flex-1">
              <div className="h-full w-full">
                <EntityField
                  displayName="Hero Image"
                  fieldId={props.image.image.field}
                  constantValueEnabled={props.image.image.constantValueEnabled}
                  fullHeight
                >
                  <Image
                    image={image}
                    className="h-full w-full"
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
              </div>
            </div>
          ) : null}
          <Background
            as="div"
            background={props.section.backgroundColor}
            className="flex flex-col items-start gap-5 px-5 py-10 text-left lg:flex-1 lg:items-center lg:justify-center lg:px-12 lg:text-center"
            style={panelStyle}
          >
            <Background
              as="div"
              background={props.section.badgeBackgroundColor}
              className="rounded-full px-5 py-2.5"
              style={badgeStyle}
            >
              <EntityField
                displayName="Badge"
                fieldId={props.badge.text.field}
                constantValueEnabled={props.badge.text.constantValueEnabled}
              >
                <p
                  className="m-0"
                  style={resolveStyledTextStyles(
                    props.badge.styles,
                    props.badge?.fontColor,
                    badgeForeground,
                    "var(--fontFamily-h4-fontFamily), Georgia, serif",
                    "var(--fontSize-h4-fontSize)",
                    "var(--fontWeight-h4-fontWeight)",
                  )}
                >
                  {badge}
                </p>
              </EntityField>
            </Background>
            <div className="flex flex-col gap-2.5">
              <EntityField
                displayName="Eyebrow"
                fieldId={props.eyebrow.text.field}
                constantValueEnabled={props.eyebrow.text.constantValueEnabled}
              >
                <p
                  className="m-0"
                  style={resolveStyledTextStyles(
                    props.eyebrow.styles,
                    props.eyebrow?.fontColor,
                    panelForeground,
                    "var(--fontFamily-h3-fontFamily)",
                    "var(--fontSize-h3-fontSize)",
                    "var(--fontWeight-h3-fontWeight)",
                  )}
                >
                  {eyebrow}
                </p>
              </EntityField>
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h1
                  className="m-0"
                  style={resolveStyledTextStyles(
                    props.heading.styles,
                    props.heading?.fontColor,
                    panelForeground,
                    "var(--fontFamily-h1-fontFamily)",
                    "var(--fontSize-h1-fontSize)",
                    "var(--fontWeight-h1-fontWeight)",
                  )}
                >
                  {heading}
                </h1>
              </EntityField>
            </div>
            <EntityField
              displayName="Body"
              fieldId={props.body.text.field}
              constantValueEnabled={props.body.text.constantValueEnabled}
            >
              <div style={bodyTextStyle}>
                {React.isValidElement(body) ? (
                  body
                ) : typeof body === "string" ||
                  (body && typeof body === "object" && "html" in body) ? (
                  <MaybeRTF data={body as string | { html: string }} />
                ) : null}
              </div>
            </EntityField>
            {rating !== undefined && count !== undefined ? (
              <div
                className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5"
                style={bodyTextStyle}
              >
                <span>{rating.toFixed(1)} stars</span>
                <StarRow rating={rating} />
                <span>from {count.toLocaleString()} guest reviews</span>
              </div>
            ) : null}
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              <EntityField
                displayName="Primary Call to Action"
                fieldId={props.primaryCta.data.cta.field}
                constantValueEnabled={
                  props.primaryCta.data.cta.constantValueEnabled
                }
              >
                <ComprehensiveCTA
                  value={primaryCtaValue}
                  eventName="primaryCta"
                  className={
                    props.primaryCta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-fit max-w-full items-center self-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-tertiary)] focus-visible:text-[var(--colors-palette-tertiary)]"
                      : "w-fit max-w-full self-start"
                  }
                />
              </EntityField>
              <EntityField
                displayName="Secondary Call to Action"
                fieldId={props.secondaryCta.data.cta.field}
                constantValueEnabled={
                  props.secondaryCta.data.cta.constantValueEnabled
                }
              >
                <ComprehensiveCTA
                  value={secondaryCtaValue}
                  eventName="secondaryCta"
                  className={
                    props.secondaryCta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-fit max-w-full items-center self-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-tertiary)] focus-visible:text-[var(--colors-palette-tertiary)]"
                      : "w-fit max-w-full self-start"
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

export const FamilyDestinationHero: YextComponentConfig<FamilyDestinationHeroProps> =
  {
    label: "Hero",
    fields: toPuckFields(fields),
    defaultProps: {
      eyebrow: {
        text: {
          field: "geomodifier",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      heading: {
        text: {
          field: "name",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "[[name]] - [[geomodifier]] [[address.city]] is a luxury boutique hotel offering a curated blend of historic Southern charm, modern amenities, and sophisticated comfort. Experience personalized concierge services, a chef-driven culinary program, and an unmatched location in the heart of [[address.city]].",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      badge: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Rooms Available for Booking",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
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
        imageConstrain: "filled",
      },
      primaryCta: {
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
            selectedColor: "palette-primary",
            contrastingColor: "palette-primary-contrast",
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
      secondaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Explore Special Offers",
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
          variant: "link",
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
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        badgeBackgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: (props) => <HeroComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
