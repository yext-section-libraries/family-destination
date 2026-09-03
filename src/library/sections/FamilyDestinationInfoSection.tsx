import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  Address,
  AnalyticsScopeProvider,
  Link,
  type AddressType,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  MaybeRTF,
  resolveComponentData,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { parsePhoneNumber } from "awesome-phonenumber";

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type SharedTextStyles = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ServiceHourItem = {
  label: YextEntityField<TranslatableString>;
  value: YextEntityField<TranslatableString>;
};

export type FamilyDestinationInfoSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    panelBorderColor: ThemeColor;
  };
  summary: {
    heading: YextEntityField<TranslatableString>;
    address: {
      subheading: YextEntityField<TranslatableString>;
      address: YextEntityField<AddressType>;
      showRegion: boolean;
      showCountry: boolean;
    };
    phone: {
      subheading: YextEntityField<TranslatableString>;
      phoneNumbers: PhoneFieldProps;
    };
    accessibility: {
      subheading: YextEntityField<TranslatableString>;
      text: YextEntityField<TranslatableRichText>;
    };
    checkInOut: {
      subheading: YextEntityField<TranslatableString>;
      text: YextEntityField<TranslatableRichText>;
    };
    primaryCta: ComprehensiveCTAValue;
    secondaryCta: ComprehensiveCTAValue;
  };
  serviceHours: {
    heading: YextEntityField<TranslatableString>;
    items: ServiceHourItem[];
  };
  complimentaryServices: {
    heading: YextEntityField<TranslatableString>;
    items: YextEntityField<TranslatableString[]>;
  };
  styles: {
    headings: SharedTextStyles;
    subheadings: SharedTextStyles;
    body: SharedTextStyles;
  };
};

type RichTextStyleOverrides = NonNullable<
  React.ComponentProps<typeof MaybeRTF>["richTextStyleOverrides"]
>;

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
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

const createLinkCta = (label: string, link: string): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: { defaultValue: label, hasLocalizedValue: "true" },
        link: { defaultValue: link, hasLocalizedValue: "true" },
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

const getEntityFieldSummary = (
  value: YextEntityField<TranslatableString>,
  fallback: string,
) =>
  (typeof value.constantValue === "string"
    ? value.constantValue
    : value.constantValue?.defaultValue) ||
  value.field ||
  fallback;

const resolveTextStyles = (
  value: SharedTextStyles | undefined,
  fallbackColor: string,
  fallbackFontFamily: string,
  fallbackFontSize: string,
  fallbackFontWeight: React.CSSProperties["fontWeight"],
): React.CSSProperties => ({
  color: getThemeColorCssValue(value?.fontColor) ?? fallbackColor,
  fontFamily:
    !value?.styles?.fontFamily || value.styles.fontFamily === "default"
      ? fallbackFontFamily
      : value.styles.fontFamily,
  fontSize:
    !value?.styles?.fontSize || value.styles.fontSize === "default"
      ? fallbackFontSize
      : value.styles.fontSize,
  fontWeight:
    !value?.styles?.fontWeight || value.styles.fontWeight === "default"
      ? fallbackFontWeight
      : value.styles.fontWeight,
  fontStyle:
    !value?.styles?.fontStyle || value.styles.fontStyle === "default"
      ? undefined
      : value.styles.fontStyle,
  textTransform:
    !value?.styles?.textTransform || value.styles.textTransform === "default"
      ? undefined
      : value.styles.textTransform,
});

const formatPhoneNumber = (
  phoneNumber: string,
  format: "international" | "domestic",
) => {
  const cleanedPhoneNumber = phoneNumber.replace(/(?!^\+)\+|[^\d+]/g, "");
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumber);

  if (!parsedPhoneNumber.valid || !parsedPhoneNumber.number) {
    return phoneNumber;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
};

const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides: RichTextStyleOverrides,
) => {
  if (React.isValidElement(value)) {
    return value;
  }

  if (typeof value === "string") {
    return (
      <MaybeRTF data={value} richTextStyleOverrides={richTextStyleOverrides} />
    );
  }

  if (value && typeof value === "object" && "html" in value) {
    return (
      <MaybeRTF
        data={value as { html: string }}
        richTextStyleOverrides={richTextStyleOverrides}
      />
    );
  }

  return null;
};

const fields: YextFields<FamilyDestinationInfoSectionProps> = {
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
      panelBorderColor: {
        label: "Panel Border Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  summary: {
    label: "Summary",
    type: "object",
    objectFields: {
      heading: {
        type: "entityField",
        label: "Heading",
        filter: { types: ["type.string"] },
      },
      address: {
        label: "Address",
        type: "object",
        objectFields: {
          subheading: {
            type: "entityField",
            label: "Subheading",
            filter: { types: ["type.string"] },
          },
          address: {
            type: "entityField",
            label: "Address",
            filter: { types: ["type.address"] },
          },
          showRegion: {
            label: "Show Region",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showCountry: {
            label: "Show Country",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      phone: {
        label: "Phone",
        type: "object",
        objectFields: {
          subheading: {
            type: "entityField",
            label: "Subheading",
            filter: { types: ["type.string"] },
          },
          phoneNumbers: {
            label: "Phone Numbers",
            type: "object",
            objectFields: {
              items: {
                label: "Items",
                type: "array",
                arrayFields: {
                  number: {
                    type: "entityField",
                    label: "Number",
                    filter: { types: ["type.phone"] },
                  },
                  label: { label: "Label", type: "text" },
                },
                defaultItemProps: {
                  number: {
                    field: "",
                    constantValue: "",
                    constantValueEnabled: true,
                  },
                  label: "",
                },
                getItemSummary: (item) =>
                  item.label ||
                  item.number.constantValue ||
                  item.number.field ||
                  "Phone",
              },
              phoneFormat: {
                label: "Phone Format",
                type: "radio",
                options: [
                  { label: "Domestic", value: "domestic" },
                  { label: "International", value: "international" },
                ],
              },
              includeHyperlink: {
                label: "Include Hyperlink",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
            },
          },
        },
      },
      accessibility: {
        label: "Accessibility",
        type: "object",
        objectFields: {
          subheading: {
            type: "entityField",
            label: "Subheading",
            filter: { types: ["type.string"] },
          },
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.rich_text_v2"] },
          },
        },
      },
      checkInOut: {
        label: "Check In/Out",
        type: "object",
        objectFields: {
          subheading: {
            type: "entityField",
            label: "Subheading",
            filter: { types: ["type.string"] },
          },
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.rich_text_v2"] },
          },
        },
      },
      primaryCta: {
        label: "Primary Call to Action",
        type: "comprehensiveCTA",
      },
      secondaryCta: {
        label: "Secondary Call to Action",
        type: "comprehensiveCTA",
      },
    },
  },
  serviceHours: {
    label: "Service Hours",
    type: "object",
    objectFields: {
      heading: {
        type: "entityField",
        label: "Heading",
        filter: { types: ["type.string"] },
      },
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          label: {
            type: "entityField",
            label: "Label",
            filter: { types: ["type.string"] },
          },
          value: {
            type: "entityField",
            label: "Value",
            filter: { types: ["type.string"] },
          },
        },
        defaultItemProps: {
          label: createTextField("Service"),
          value: createTextField("Hours"),
        },
        getItemSummary: (item) => getEntityFieldSummary(item.label, "Service"),
      },
    },
  },
  complimentaryServices: {
    label: "Complimentary Services",
    type: "object",
    objectFields: {
      heading: {
        type: "entityField",
        label: "Heading",
        filter: { types: ["type.string"] },
      },
      items: {
        type: "entityField",
        label: "Services",
        filter: { types: ["type.string"], includeListsOnly: true },
      },
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      headings: {
        label: "Headings",
        type: "object",
        objectFields: {
          styles: { label: "Text Styles", type: "styledText" },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      subheadings: {
        label: "Subheadings",
        type: "object",
        objectFields: {
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
          styles: { label: "Text Styles", type: "styledText" },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
    },
  },
};

const InfoComponent: PuckComponent<FamilyDestinationInfoSectionProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const headingStyles = resolveTextStyles(
    props.styles?.headings,
    sectionForeground,
    "var(--fontFamily-h2-fontFamily)",
    "var(--fontSize-h2-fontSize)",
    "var(--fontWeight-h2-fontWeight)",
  );
  const subheadingStyles = resolveTextStyles(
    props.styles?.subheadings,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const bodyStyles = resolveTextStyles(
    props.styles?.body,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const richTextStyleOverrides: RichTextStyleOverrides = {
    ...props.styles?.body?.styles,
    color: bodyStyles.color,
  };
  const panelStyle: React.CSSProperties = {
    borderColor:
      getThemeColorCssValue(props.section.panelBorderColor) ??
      sectionForeground,
    color: sectionForeground,
  };

  const summaryHeading =
    resolveComponentData(props.summary.heading, locale, streamDocument) || "";
  const addressSubheading =
    resolveComponentData(
      props.summary.address.subheading,
      locale,
      streamDocument,
    ) || "";
  const resolvedAddress = resolveComponentData(
    props.summary.address.address,
    locale,
    streamDocument,
  );
  const phoneSubheading =
    resolveComponentData(
      props.summary.phone.subheading,
      locale,
      streamDocument,
    ) || "";
  const accessibilitySubheading =
    resolveComponentData(
      props.summary.accessibility.subheading,
      locale,
      streamDocument,
    ) || "";
  const accessibilityText = resolveComponentData(
    props.summary.accessibility.text,
    locale,
    streamDocument,
    { richTextStyleOverrides },
  );
  const checkInOutSubheading =
    resolveComponentData(
      props.summary.checkInOut.subheading,
      locale,
      streamDocument,
    ) || "";
  const checkInOutText = resolveComponentData(
    props.summary.checkInOut.text,
    locale,
    streamDocument,
    { richTextStyleOverrides },
  );
  const serviceHoursHeading =
    resolveComponentData(props.serviceHours.heading, locale, streamDocument) ||
    "";
  const complimentaryServicesHeading =
    resolveComponentData(
      props.complimentaryServices.heading,
      locale,
      streamDocument,
    ) || "";
  const complimentaryServices = (
    resolveComponentData(
      props.complimentaryServices.items,
      locale,
      streamDocument,
    ) ?? []
  ).filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  const phoneItems = (props.summary.phone.phoneNumbers.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const number =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";

      if (!number) {
        return null;
      }

      return {
        field: item.number,
        label: item.label?.trim() ?? "",
        number,
        formattedNumber: formatPhoneNumber(
          number,
          props.summary.phone.phoneNumbers.phoneFormat,
        ),
        telDigits: number.replace(/\D/g, ""),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const primaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: props.summary.primaryCta.data,
    styles: props.summary.primaryCta.styles,
    className: props.summary.primaryCta.className,
    eventName: props.summary.primaryCta.eventName,
  };
  const secondaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: props.summary.secondaryCta.data,
    styles: props.summary.secondaryCta.styles,
    className: props.summary.secondaryCta.className,
    eventName: props.summary.secondaryCta.eventName,
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationInfoSection${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-info-section flex flex-col items-stretch gap-10 px-5 py-10 lg:flex-row lg:gap-20 lg:px-12 lg:py-20"
          style={sectionStyle}
          aria-label="Hotel information"
        >
          <article
            className="flex min-w-0 flex-1 flex-col gap-4 border p-5"
            style={panelStyle}
          >
            <EntityField
              displayName="Summary Heading"
              fieldId={props.summary.heading.field}
              constantValueEnabled={props.summary.heading.constantValueEnabled}
            >
              <h2 className="m-0 leading-[26.4px]" style={headingStyles}>
                {summaryHeading}
              </h2>
            </EntityField>

            <div className="flex flex-col gap-1">
              <EntityField
                displayName="Address Subheading"
                fieldId={props.summary.address.subheading.field}
                constantValueEnabled={
                  props.summary.address.subheading.constantValueEnabled
                }
              >
                <p className="m-0 tracking-[0.25px]" style={subheadingStyles}>
                  {addressSubheading}
                </p>
              </EntityField>
              {resolvedAddress ? (
                <EntityField
                  displayName="Address"
                  fieldId={props.summary.address.address.field}
                  constantValueEnabled={
                    props.summary.address.address.constantValueEnabled
                  }
                >
                  <div className="tracking-[0.25px]" style={bodyStyles}>
                    <Address
                      address={resolvedAddress}
                      showRegion={props.summary.address.showRegion}
                      showCountry={props.summary.address.showCountry}
                    />
                  </div>
                </EntityField>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <EntityField
                displayName="Phone Subheading"
                fieldId={props.summary.phone.subheading.field}
                constantValueEnabled={
                  props.summary.phone.subheading.constantValueEnabled
                }
              >
                <p className="m-0 tracking-[0.25px]" style={subheadingStyles}>
                  {phoneSubheading}
                </p>
              </EntityField>
              {phoneItems.map((item, index) => {
                const content = item.label
                  ? `${item.label} ${item.formattedNumber}`
                  : item.formattedNumber;

                return (
                  <EntityField
                    key={`${item.number}-${index}`}
                    displayName="Phone Number"
                    fieldId={item.field.field}
                    constantValueEnabled={item.field.constantValueEnabled}
                  >
                    {props.summary.phone.phoneNumbers.includeHyperlink &&
                    item.telDigits ? (
                      <Link
                        cta={{ link: item.telDigits, linkType: "PHONE" }}
                        eventName={`phone-${index}`}
                        className="w-fit tracking-[0.25px] underline"
                        style={{ ...bodyStyles, color: "inherit" }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <p className="m-0 tracking-[0.25px]" style={bodyStyles}>
                        {content}
                      </p>
                    )}
                  </EntityField>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <EntityField
                displayName="Accessibility Subheading"
                fieldId={props.summary.accessibility.subheading.field}
                constantValueEnabled={
                  props.summary.accessibility.subheading.constantValueEnabled
                }
              >
                <p className="m-0 tracking-[0.25px]" style={subheadingStyles}>
                  {accessibilitySubheading}
                </p>
              </EntityField>
              <EntityField
                displayName="Accessibility Text"
                fieldId={props.summary.accessibility.text.field}
                constantValueEnabled={
                  props.summary.accessibility.text.constantValueEnabled
                }
              >
                <div className="tracking-[0.25px]" style={bodyStyles}>
                  {renderResolvedRichText(
                    accessibilityText,
                    richTextStyleOverrides,
                  )}
                </div>
              </EntityField>
            </div>

            <div className="flex flex-col gap-1">
              <EntityField
                displayName="Check In/Out Subheading"
                fieldId={props.summary.checkInOut.subheading.field}
                constantValueEnabled={
                  props.summary.checkInOut.subheading.constantValueEnabled
                }
              >
                <p className="m-0 tracking-[0.25px]" style={subheadingStyles}>
                  {checkInOutSubheading}
                </p>
              </EntityField>
              <EntityField
                displayName="Check In/Out Text"
                fieldId={props.summary.checkInOut.text.field}
                constantValueEnabled={
                  props.summary.checkInOut.text.constantValueEnabled
                }
              >
                <div className="tracking-[0.25px]" style={bodyStyles}>
                  {renderResolvedRichText(
                    checkInOutText,
                    richTextStyleOverrides,
                  )}
                </div>
              </EntityField>
            </div>

            <div className="flex flex-wrap gap-5">
              <EntityField
                displayName="Primary Call to Action"
                fieldId={props.summary.primaryCta.data.cta.field}
                constantValueEnabled={
                  props.summary.primaryCta.data.cta.constantValueEnabled
                }
              >
                <ComprehensiveCTA
                  value={primaryCtaValue}
                  eventName="infoLink-0"
                  className={
                    props.summary.primaryCta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-max max-w-full items-center border-b border-current py-4 font-bold leading-5 tracking-[0.16px] no-underline"
                      : "w-max max-w-full"
                  }
                />
              </EntityField>
              <EntityField
                displayName="Secondary Call to Action"
                fieldId={props.summary.secondaryCta.data.cta.field}
                constantValueEnabled={
                  props.summary.secondaryCta.data.cta.constantValueEnabled
                }
              >
                <ComprehensiveCTA
                  value={secondaryCtaValue}
                  eventName="infoLink-1"
                  className={
                    props.summary.secondaryCta.styles?.variant === "link"
                      ? "inline-flex min-h-12 w-max max-w-full items-center border-b border-current py-4 font-bold leading-5 tracking-[0.16px] no-underline"
                      : "w-max max-w-full"
                  }
                />
              </EntityField>
            </div>
          </article>

          <article
            className="flex min-w-0 flex-1 flex-col gap-4 border p-5"
            style={panelStyle}
          >
            <EntityField
              displayName="Service Hours Heading"
              fieldId={props.serviceHours.heading.field}
              constantValueEnabled={
                props.serviceHours.heading.constantValueEnabled
              }
            >
              <h2 className="m-0 leading-[26.4px]" style={headingStyles}>
                {serviceHoursHeading}
              </h2>
            </EntityField>
            {(props.serviceHours.items ?? []).map((item, index) => {
              const label =
                resolveComponentData(item.label, locale, streamDocument) || "";
              const value =
                resolveComponentData(item.value, locale, streamDocument) || "";

              return (
                <div
                  key={`${label || "service"}-${index}`}
                  className="flex flex-col gap-1"
                >
                  <EntityField
                    displayName="Service Label"
                    fieldId={item.label.field}
                    constantValueEnabled={item.label.constantValueEnabled}
                  >
                    <p
                      className="m-0 tracking-[0.25px]"
                      style={subheadingStyles}
                    >
                      {label}
                    </p>
                  </EntityField>
                  <EntityField
                    displayName="Service Hours"
                    fieldId={item.value.field}
                    constantValueEnabled={item.value.constantValueEnabled}
                  >
                    <p className="m-0 tracking-[0.25px]" style={bodyStyles}>
                      {value}
                    </p>
                  </EntityField>
                </div>
              );
            })}
          </article>

          <article
            className="flex min-w-0 flex-1 flex-col gap-4 border p-5"
            style={panelStyle}
          >
            <EntityField
              displayName="Complimentary Services Heading"
              fieldId={props.complimentaryServices.heading.field}
              constantValueEnabled={
                props.complimentaryServices.heading.constantValueEnabled
              }
            >
              <h2 className="m-0 leading-[26.4px]" style={headingStyles}>
                {complimentaryServicesHeading}
              </h2>
            </EntityField>
            <EntityField
              displayName="Complimentary Services"
              fieldId={props.complimentaryServices.items.field}
              constantValueEnabled={
                props.complimentaryServices.items.constantValueEnabled
              }
            >
              <ul
                className="m-0 list-disc space-y-0 pl-6 leading-[30px] tracking-[0.25px]"
                style={bodyStyles}
              >
                {complimentaryServices.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </EntityField>
          </article>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationInfoSection: YextComponentConfig<FamilyDestinationInfoSectionProps> =
  {
    label: "Info Section",
    fields: toPuckFields(fields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        panelBorderColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
      summary: {
        heading: createTextField("Hotel Summary"),
        address: {
          subheading: createTextField("Address"),
          address: {
            field: "address",
            constantValue: {
              line1: "",
              city: "",
              postalCode: "",
              countryCode: "",
              region: "",
            },
            constantValueEnabled: false,
          },
          showRegion: true,
          showCountry: false,
        },
        phone: {
          subheading: createTextField("Main Reservations"),
          phoneNumbers: {
            items: [
              {
                number: {
                  field: "mainPhone",
                  constantValue: "",
                  constantValueEnabled: false,
                },
                label: "",
              },
            ],
            phoneFormat: "international",
            includeHyperlink: false,
          },
        },
        accessibility: {
          subheading: createTextField("Accessibility"),
          text: createRichTextField(
            "Step-free main entrance, ADA-compliant accessible rooms, elevator access to all floors, braille signage",
          ),
        },
        checkInOut: {
          subheading: createTextField("Check-In/Out"),
          text: createRichTextField(
            "Standard Check-In: 4:00 PM | Standard Check-Out: 11:00 AM",
          ),
        },
        primaryCta: createLinkCta("Visit Website", "#"),
        secondaryCta: createLinkCta("Check Availability", "#"),
      },
      serviceHours: {
        heading: createTextField("Desk & Service Hours"),
        items: [
          {
            label: createTextField("Front Desk"),
            value: createTextField("24 Hours / 7 Days"),
          },
          {
            label: createTextField("Concierge Desk"),
            value: createTextField("7:00 AM - 10:00 PM Daily"),
          },
          {
            label: createTextField("Room Service"),
            value: createTextField("6:00 AM - Midnight Daily"),
          },
          {
            label: createTextField("Housekeeping"),
            value: createTextField(
              "Daily service 8:00 AM - 4:00 PM (Turndown service upon request)",
            ),
          },
          {
            label: createTextField("Valet Parking"),
            value: createTextField("24 Hours / 7 Days"),
          },
        ],
      },
      complimentaryServices: {
        heading: createTextField("Complimentary Services"),
        items: {
          field: "",
          constantValue: [
            "High-Speed Wi-Fi (Property-Wide)",
            "Morning Artisanal Coffee & Tea Station",
            "Evening Social Hour (Local Wine & Cheese)",
            "Digital Concierge App Access",
            "Luxury Bicycle Rentals",
            "Free cancellation up to 48 hours prior to arrival for direct bookings",
          ],
          constantValueEnabled: true,
        },
      },
      styles: {
        headings: { styles: {...defaultTextStyles, fontSize: "24px"}, fontColor: undefined },
        subheadings: { styles: defaultTextStyles, fontColor: undefined },
        body: { styles: defaultTextStyles, fontColor: undefined },
      },
    },
    render: (props) => <InfoComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationInfoSection",
  displayName: "Info Section",
  description: "Info Section",
  pageSetTypes: ["ENTITY"],
};
