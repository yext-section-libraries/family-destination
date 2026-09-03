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
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  isLocalizedAssetImage,
  MaybeRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
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
.yext-family-destination-amenities p,
.yext-family-destination-amenities li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-amenities h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-amenities h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-amenities h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-amenities h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-amenities h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-amenities h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-amenities) a {
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

type ImageField = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  imageConstrain: "fixed" | "filled";
};

type AuthoredComprehensiveCTAValue = Omit<ComprehensiveCTAValue, "sx"> & {
  sx?: Record<string, unknown>;
};

type AmenityItemProps = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  iconImage: YextEntityField<TranslatableAssetImage>;
  action: AuthoredComprehensiveCTAValue;
};

type AmenitiesStyles = {
  itemTitle: SharedTextStyleProps;
  itemDescription: SharedTextStyleProps;
  iconBorderColor?: ThemeColor;
  iconBackgroundColor?: ThemeColor;
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

const defaultIconBorderColor: ThemeColor = {
  selectedColor: "palette-secondary",
  contrastingColor: "palette-secondary-contrast",
};

const defaultIconBackgroundColor: ThemeColor = {
  selectedColor: "white",
  contrastingColor: "black",
};

const createIconImageDefault = (
  url: string,
): YextEntityField<TranslatableAssetImage> => ({
  field: "",
  constantValue: {
    url,
    width: 60,
    height: 60,
  },
  constantValueEnabled: true,
});

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

const createTextCta = (label: string): AuthoredComprehensiveCTAValue => ({
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

const renderResolvedRichText = (value: unknown, style: React.CSSProperties) => {
  if (React.isValidElement(value)) {
    return <div style={style}>{value}</div>;
  }

  if (typeof value === "string" || (value && typeof value === "object")) {
    return (
      <div style={style}>
        <MaybeRTF data={value as string | { html: string }} />
      </div>
    );
  }

  return null;
};

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

const getImageUrl = (image: unknown): string | undefined => {
  if (!image || typeof image !== "object") {
    return undefined;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url;
  }

  if (
    "image" in image &&
    image.image &&
    typeof image.image === "object" &&
    "url" in image.image &&
    typeof image.image.url === "string"
  ) {
    return image.image.url;
  }

  return undefined;
};

const hasImageSource = (image: unknown): boolean =>
  Boolean(getImageUrl(image)?.trim());

const amenitiesSource = createItemSource<AmenityItemProps>({
  label: "Amenities",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    iconImage: {
      type: "entityField",
      label: "Icon Image",
      filter: { types: ["type.image"] },
    },
    action: {
      label: "CTA",
      type: "comprehensiveCTA",
      ...{ showIncludeCaretField: false },
    },
  },
  defaultValues: [
    {
      title: createStringFieldDefault("The Courtyard Lounge & Bar"),
      description: createRichTextFieldDefault(
        "Sip masterfully crafted cocktails, local craft beers, and small plates in our intimate, open-air garden courtyard.",
      ),
      iconImage: createIconImageDefault("https://placehold.co/60x60"),
      action: createTextCta("View Drink Menu"),
    },
    {
      title: createStringFieldDefault("Elite Fitness Center"),
      description: createRichTextFieldDefault(
        "Maintain your routine with state-of-the-art cardio machines, free weights, Peloton bikes, and complimentary yoga mats.",
      ),
      iconImage: createIconImageDefault("https://placehold.co/60x60"),
      action: createTextCta("See Equipment List"),
    },
    {
      title: createStringFieldDefault("Rooftop Oasis Pool"),
      description: createRichTextFieldDefault(
        "Relax and unwind by our heated outdoor pool, featuring premium lounge chairs, private cabanas, and poolside beverage service.",
      ),
      iconImage: createIconImageDefault("https://placehold.co/60x60/png"),
      action: createTextCta("Reserve a Cabana"),
    },
  ],
});

export type FamilyDestinationAmenitiesProps = {
  heading: StyledTextProps;
  amenities: {
    data: Parameters<typeof amenitiesSource.resolveItems>[0];
    styles: AmenitiesStyles;
  };
  image: ImageField;
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};

const fields: YextFields<FamilyDestinationAmenitiesProps> = {
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
  amenities: {
    label: "Amenities",
    type: "object",
    objectFields: {
      data: amenitiesSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          itemTitle: {
            label: "Item Title",
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
          itemDescription: {
            label: "Item Description",
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
          iconBorderColor: {
            label: "Icon Border Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          iconBackgroundColor: {
            label: "Icon Background Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
    },
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

const Component: PuckComponent<FamilyDestinationAmenitiesProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const amenities = amenitiesSource.resolveItems(
    props.amenities.data,
    streamDocument,
  );
  const authoredAmenities = props.amenities.data?.constantValue ?? [];
  const resolvedImage = resolveComponentData(
    props.image.image,
    locale,
    streamDocument,
  );
  const sectionImage = hasImageSource(resolvedImage)
    ? resolvedImage
    : undefined;
  const itemTitleColor =
    getThemeColorCssValue(props.amenities.styles.itemTitle?.fontColor) ??
    sectionForeground;
  const itemDescriptionColor =
    getThemeColorCssValue(props.amenities.styles.itemDescription?.fontColor) ??
    sectionForeground;
  const iconBorderColor =
    getThemeColorCssValue(props.amenities.styles.iconBorderColor) ??
    getThemeColorCssValue(defaultIconBorderColor) ??
    sectionForeground;
  const iconBackgroundColor =
    getThemeColorCssValue(props.amenities.styles.iconBackgroundColor) ??
    getThemeColorCssValue(defaultIconBackgroundColor) ??
    "transparent";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationAmenities${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          className={
            sectionImage
              ? "yext-family-destination-amenities grid grid-cols-1 lg:grid-cols-2"
              : "yext-family-destination-amenities grid grid-cols-1"
          }
        >
          <style>{typographyStyles}</style>
          <Background
            as="div"
            background={props.section.backgroundColor}
            className="flex flex-col gap-10 px-5 py-10 lg:order-2 lg:px-12 lg:py-20"
            style={sectionStyle}
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
                  sectionForeground,
                  "var(--fontFamily-h2-fontFamily)",
                  "var(--fontSize-h2-fontSize)",
                  "var(--fontWeight-h2-fontWeight)",
                )}
              >
                {heading}
              </h2>
            </EntityField>
            <div className="m-0 flex flex-col gap-10 p-0 lg:gap-[50px]">
              <EntityField
                displayName="Amenities"
                fieldId={props.amenities.data?.field}
                constantValueEnabled={
                  props.amenities.data?.constantValueEnabled
                }
                className="flex flex-col gap-10 lg:gap-[50px]"
              >
                {amenities.map((amenity, index) => {
                  const title = resolveTranslatableString(
                    amenity.title,
                    locale,
                  );
                  const description = amenity.description
                    ? resolveComponentData(
                        amenity.description,
                        locale,
                        streamDocument,
                        {
                          richTextStyleOverrides: {
                            ...props.amenities.styles.itemDescription.styles,
                            color: itemDescriptionColor,
                          },
                        },
                      )
                    : null;
                  const authoredAmenity = authoredAmenities[index];
                  const resolvedIconImage = isLocalizedAssetImage(
                    amenity.iconImage,
                  )
                    ? resolveLocalizedAssetImage(amenity.iconImage, locale)
                    : amenity.iconImage;
                  const iconImage = hasImageSource(resolvedIconImage)
                    ? resolvedIconImage
                    : undefined;

                  return (
                    <article
                      key={`${title || "amenity"}-${index}`}
                      className="flex items-start gap-5"
                    >
                      {iconImage ? (
                        <div
                          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border"
                          style={{
                            borderColor: iconBorderColor,
                            backgroundColor: iconBackgroundColor,
                          }}
                        >
                          <Image
                            image={iconImage}
                            className="h-[30px] w-[30px]"
                            style={{
                              display: "block",
                              width: "30px",
                              height: "30px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col gap-2.5">
                        <h3
                          className="m-0"
                          style={resolveStyledTextStyles(
                            props.amenities.styles.itemTitle.styles,
                            props.amenities.styles.itemTitle?.fontColor,
                            itemTitleColor,
                            "var(--fontFamily-h4-fontFamily)",
                            "var(--fontSize-h4-fontSize)",
                            "var(--fontWeight-h4-fontWeight)",
                          )}
                        >
                          {title}
                        </h3>
                        <div className="m-0 leading-6">
                          {renderResolvedRichText(description, {
                            ...resolveStyledTextStyles(
                              props.amenities.styles.itemDescription.styles,
                              props.amenities.styles.itemDescription?.fontColor,
                              itemDescriptionColor,
                              "var(--fontFamily-body-fontFamily)",
                              "var(--fontSize-body-fontSize)",
                              "var(--fontWeight-body-fontWeight)",
                            ),
                            lineHeight: "1.5rem",
                          })}
                        </div>
                        {authoredAmenity?.action ? (
                          <EntityField
                            displayName="Amenity Call to Action"
                            fieldId={authoredAmenity.action.data.cta.field}
                            constantValueEnabled={
                              authoredAmenity.action.data.cta
                                .constantValueEnabled
                            }
                          >
                            <ComprehensiveCTA
                              value={{
                                data: authoredAmenity.action.data,
                                styles: authoredAmenity.action.styles,
                                className: authoredAmenity.action.className,
                                eventName: authoredAmenity.action.eventName,
                              }}
                              eventName={`amenityCta-${index}`}
                              className={
                                authoredAmenity.action.styles?.variant ===
                                "link"
                                  ? "inline-flex min-h-12 w-max max-w-full items-center self-start justify-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-tertiary)] focus-visible:text-[var(--colors-palette-tertiary)]"
                                  : "justify-center"
                              }
                            />
                          </EntityField>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </EntityField>
            </div>
          </Background>
          {sectionImage ? (
            <figure className="relative m-0 h-80 overflow-hidden sm:h-[500px] lg:order-1 lg:h-auto lg:self-stretch">
              <EntityField
                displayName="Image"
                fieldId={props.image.image.field}
                constantValueEnabled={props.image.image.constantValueEnabled}
                fullHeight
              >
                <Image
                  image={sectionImage}
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

export const FamilyDestinationAmenities: YextComponentConfig<FamilyDestinationAmenitiesProps> =
  {
    label: "Amenities",
    fields: toPuckFields(fields),
    defaultProps: {
      heading: createHeadingDefault("Resort Amenities"),
      amenities: {
        data: amenitiesSource.defaultValue,
        styles: {
          itemTitle: defaultSharedTextStyle,
          itemDescription: defaultSharedTextStyle,
          iconBorderColor: defaultIconBorderColor,
          iconBackgroundColor: defaultIconBackgroundColor,
        },
      },
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
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
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
    },
    render: (props) => <Component {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationAmenities",
  displayName: "Amenities",
  description: "Amenities",
  pageSetTypes: ["ENTITY"],
};
