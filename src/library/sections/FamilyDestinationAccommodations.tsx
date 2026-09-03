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
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  isLocalizedAssetImage,
  resolveComponentData,
  resolveLocalizedAssetImage,
  type ComprehensiveCTAValue,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableString,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

const typographyStyles = `
.yext-family-destination-accommodations p,
.yext-family-destination-accommodations li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-accommodations h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-accommodations h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-accommodations h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-accommodations h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-accommodations h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-accommodations h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-accommodations) a {
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

type SharedImageStyleProps = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type AuthoredComprehensiveCTAValue = Omit<ComprehensiveCTAValue, "sx"> & {
  sx?: Record<string, unknown>;
};

type RoomItemProps = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableString>;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  cta: AuthoredComprehensiveCTAValue;
};

type RoomStyles = {
  heading: SharedTextStyleProps;
  description: SharedTextStyleProps;
  image: SharedImageStyleProps;
};

const placeholder =
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg";

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
};

const createTextField = (
  value: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue: value,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createCtaDefault = (label: string): AuthoredComprehensiveCTAValue => ({
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

const roomSource = createItemSource<RoomItemProps>({
  label: "Rooms",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.string"] },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    cta: {
      label: "CTA",
      type: "comprehensiveCTA",
      ...{ showIncludeCaretField: false },
    },
  },
  defaultValues: [
    {
      title: createTextField("Deluxe King Room"),
      description: createTextField(
        "A spacious, light-filled room featuring a plush king-size bed, a dedicated workspace, and a spa-inspired marble bathroom.",
      ),
      image: {
        field: "",
        constantValue: { url: placeholder, width: 1267, height: 1900 },
        constantValueEnabled: true,
      },
      cta: createCtaDefault("Check Availability"),
    },
    {
      title: createTextField("Executive Double Queen"),
      description: createTextField(
        "Perfect for families or small groups, offering two queen-size beds, a comfortable seating area, and luxury bath amenities.",
      ),
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createCtaDefault("Check Availability"),
    },
    {
      title: createTextField("The [[name]] King Suite"),
      description: createTextField(
        "Our signature penthouse suite featuring a separate living parlor, a private balcony overlooking the skyline, and a soaking tub.",
      ),
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createCtaDefault("Check Availability"),
    },
  ],
});

export type FamilyDestinationAccommodationsProps = {
  heading: StyledTextProps;
  description: StyledTextProps;
  rooms: {
    data: Parameters<typeof roomSource.resolveItems>[0];
    styles: RoomStyles;
  };
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};

const fields: YextFields<FamilyDestinationAccommodationsProps> = {
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
  rooms: {
    label: "Rooms",
    type: "object",
    objectFields: {
      data: roomSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          heading: {
            label: "Item Heading",
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
          description: {
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
          image: {
            label: "Room Image",
            type: "object",
            objectFields: {
              aspectRatio: {
                label: "Aspect Ratio",
                type: "basicSelector",
                options: "ASPECT_RATIO",
              },
              imageConstrain: {
                label: "Image Constrain",
                type: "select",
                options: [
                  { label: "Fixed", value: "fixed" },
                  { label: "Filled", value: "filled" },
                ],
              },
              styles: {
                label: "Image Styles",
                type: "styledImage",
              },
            },
          },
        },
      },
    },
  },
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

const RoomImage = ({
  image,
  styles,
}: {
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined;
  styles: SharedImageStyleProps;
}) => {
  return hasImageSource(image) ? (
    <Image
      image={image}
      className="h-full w-full"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: styles.imageConstrain === "filled" ? "cover" : "contain",
      }}
    />
  ) : null;
};

const Component: PuckComponent<FamilyDestinationAccommodationsProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const description =
    resolveComponentData(props.description.text, locale, streamDocument) || "";
  const rooms = roomSource.resolveItems(props.rooms.data, streamDocument);
  const authoredRooms = props.rooms.data?.constantValue ?? [];
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationAccommodations${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-accommodations flex flex-col items-center gap-10 px-5 py-10 lg:gap-8 lg:px-12 lg:py-20"
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          <div className="flex max-w-[700px] flex-col gap-2.5 text-left lg:text-center">
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
            <EntityField
              displayName="Description"
              fieldId={props.description.text.field}
              constantValueEnabled={props.description.text.constantValueEnabled}
            >
              <p
                className="m-0"
                style={{
                  ...resolveStyledTextStyles(
                    props.description.styles,
                    props.description?.fontColor,
                    sectionForeground,
                    "var(--fontFamily-body-fontFamily)",
                    "var(--fontSize-body-fontSize)",
                    "var(--fontWeight-body-fontWeight)",
                  ),
                  lineHeight: "26px",
                }}
              >
                {description}
              </p>
            </EntityField>
          </div>
          <EntityField
            displayName="Accommodations"
            fieldId={props.rooms.data?.field}
            constantValueEnabled={props.rooms.data?.constantValueEnabled}
            className="flex w-full flex-col gap-8"
          >
            {rooms.map((room, index) => {
              const title = resolveTranslatableString(room.title, locale);
              const roomDescription = resolveTranslatableString(
                room.description,
                locale,
              );
              const authoredRoom = authoredRooms[index];
              const roomImage = isLocalizedAssetImage(room.image)
                ? resolveLocalizedAssetImage(room.image, locale)
                : room.image;
              const hasRoomImage = hasImageSource(roomImage);
              const imageWrapperStyle: React.CSSProperties = {
                aspectRatio:
                  props.rooms.styles.image.aspectRatio > 0
                    ? props.rooms.styles.image.aspectRatio
                    : undefined,
                borderRadius:
                  props.rooms.styles.image.styles?.borderRadius === "default"
                    ? undefined
                    : props.rooms.styles.image.styles?.borderRadius,
                overflow:
                  props.rooms.styles.image.imageConstrain === "filled" ||
                  Boolean(
                    props.rooms.styles.image.styles?.borderRadius &&
                    props.rooms.styles.image.styles.borderRadius !== "default",
                  )
                    ? "hidden"
                    : undefined,
                width: "100%",
              };

              return (
                <article
                  key={`${title || "room"}-${index}`}
                  className={`flex w-full flex-col items-stretch gap-5 ${
                    hasRoomImage ? "lg:flex-row lg:items-center lg:gap-10" : ""
                  } ${hasRoomImage && index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="flex flex-1 flex-col items-start gap-2.5">
                    <h3
                      className="m-0"
                      style={resolveStyledTextStyles(
                        props.rooms.styles.heading.styles,
                        props.rooms.styles.heading?.fontColor,
                        sectionForeground,
                        "var(--fontFamily-h3-fontFamily)",
                        "var(--fontSize-h3-fontSize)",
                        "var(--fontWeight-h3-fontWeight)",
                      )}
                    >
                      {title}
                    </h3>
                    <p
                      className="m-0"
                      style={{
                        ...resolveStyledTextStyles(
                          props.rooms.styles.description.styles,
                          props.rooms.styles.description?.fontColor,
                          sectionForeground,
                          "var(--fontFamily-body-fontFamily)",
                          "var(--fontSize-body-fontSize)",
                          "var(--fontWeight-body-fontWeight)",
                        ),
                        lineHeight: "26px",
                      }}
                    >
                      {roomDescription}
                    </p>
                    {authoredRoom?.cta ? (
                      <EntityField
                        displayName="Room Call to Action"
                        fieldId={authoredRoom.cta.data.cta.field}
                        constantValueEnabled={
                          authoredRoom.cta.data.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          value={{
                            data: authoredRoom.cta.data,
                            styles: authoredRoom.cta.styles,
                            className: authoredRoom.cta.className,
                            eventName: authoredRoom.cta.eventName,
                          }}
                          eventName={`roomCta-${index}`}
                          className={
                            authoredRoom.cta.styles?.variant === "link"
                              ? "inline-flex min-h-12 w-max max-w-full items-center self-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-tertiary)] focus-visible:text-[var(--colors-palette-tertiary)]"
                              : undefined
                          }
                        />
                      </EntityField>
                    ) : null}
                  </div>
                  {hasRoomImage ? (
                    <figure
                      className="m-0 w-full flex-1 self-start"
                      style={imageWrapperStyle}
                    >
                      <RoomImage
                        image={roomImage}
                        styles={props.rooms.styles.image}
                      />
                    </figure>
                  ) : null}
                </article>
              );
            })}
          </EntityField>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationAccommodations: YextComponentConfig<FamilyDestinationAccommodationsProps> =
  {
    label: "Accommodations",
    fields: toPuckFields(fields),
    defaultProps: {
      heading: {
        text: createTextField("Featured Accommodations"),
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      description: {
        text: createTextField(
          "Explore our beautifully appointed guest rooms and suites, designed with custom furnishings and plush bedding for ultimate relaxation.",
        ),
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      rooms: {
        data: roomSource.defaultValue,
        styles: {
          heading: {
            styles: defaultTextStyles,
            fontColor: undefined,
          },
          description: {
            styles: defaultTextStyles,
            fontColor: undefined,
          },
          image: {
            aspectRatio: 1.67,
            imageConstrain: "filled",
            styles: defaultImageStyles,
          },
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
  id: "FamilyDestinationAccommodations",
  displayName: "Accommodations",
  description: "Accommodations",
  pageSetTypes: ["ENTITY"],
};
