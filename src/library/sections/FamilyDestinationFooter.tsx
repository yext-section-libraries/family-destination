import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  Address,
  AnalyticsScopeProvider,
  Link,
  type AddressType,
} from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

const typographyStyles = `
.yext-family-destination-footer p,
.yext-family-destination-footer li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-footer h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-footer h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-footer h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-footer h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-footer h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-footer h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-footer) a {
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

type FooterLink = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: YextEntityField<TranslatableString>;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type AddressFieldProps = {
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  styles: SharedTextStyleProps;
};

export type FamilyDestinationFooterProps = {
  logo: StyledTextProps;
  address: AddressFieldProps;
  phone: PhoneFieldProps;
  websiteUrl: YextEntityField<TranslatableString>;
  quickLinks: {
    title: StyledTextProps;
    data: FooterLink[];
    fontColor?: ThemeColor;
  };
  socialLinks: {
    title: StyledTextProps;
    data: FooterLink[];
    fontColor?: ThemeColor;
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

const formatPhoneValue = (
  phoneNumberString: string,
  format: "international" | "domestic",
) => {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );

  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);
  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
};

const fields: YextFields<FamilyDestinationFooterProps> = {
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
  logo: {
    label: "Name",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
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
  address: {
    label: "Address",
    type: "object",
    objectFields: {
      address: {
        type: "entityField",
        label: "Address",
        filter: {
          types: ["type.address"],
        },
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
      styles: {
        label: "Location Text",
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
  phone: {
    label: "Phone",
    type: "object",
    objectFields: {
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          number: {
            type: "entityField",
            label: "Number",
            filter: {
              types: ["type.phone"],
            },
          },
          label: {
            type: "entityField",
            label: "Label",
            filter: {
              types: ["type.string"],
            },
          },
        },
        defaultItemProps: {
          number: {
            field: "",
            constantValue: "",
            constantValueEnabled: true,
          } satisfies YextEntityField<string>,
          label: createTextField(""),
        },
        getItemSummary: (item) =>
          (typeof item.label?.constantValue === "string"
            ? item.label.constantValue
            : item.label?.constantValue?.defaultValue) ||
          item.number?.constantValue ||
          item.number?.field ||
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
  websiteUrl: {
    type: "entityField",
    label: "Website URL",
    filter: {
      types: ["type.string"],
    },
  },
  quickLinks: {
    label: "Quick Links",
    type: "object",
    objectFields: {
      title: {
        label: "Title",
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
      data: {
        label: "Links",
        type: "array",
        arrayFields: {
          label: {
            type: "entityField",
            label: "Label",
            filter: { types: ["type.string"] },
          },
          link: {
            type: "entityField",
            label: "Link",
            filter: { types: ["type.string"] },
          },
        },
        defaultItemProps: {
          label: createTextField("Link"),
          link: createTextField("#"),
        },
        getItemSummary: (item: FooterLink) =>
          (typeof item.label.constantValue === "string"
            ? item.label.constantValue
            : item.label.constantValue?.defaultValue) ||
          item.label.field ||
          "Link",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "object",
    objectFields: {
      title: {
        label: "Title",
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
      data: {
        label: "Links",
        type: "array",
        arrayFields: {
          label: {
            type: "entityField",
            label: "Label",
            filter: { types: ["type.string"] },
          },
          link: {
            type: "entityField",
            label: "Link",
            filter: { types: ["type.string"] },
          },
        },
        defaultItemProps: {
          label: createTextField("Link"),
          link: createTextField("#"),
        },
        getItemSummary: (item: FooterLink) =>
          (typeof item.label.constantValue === "string"
            ? item.label.constantValue
            : item.label.constantValue?.defaultValue) ||
          item.label.field ||
          "Link",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
};

const LinkColumn = ({
  title,
  titleField,
  displayName,
  titleStyle,
  links,
  eventPrefix,
  color,
  locale,
  streamDocument,
}: {
  title: string;
  titleField: YextEntityField<TranslatableString>;
  displayName: string;
  titleStyle: React.CSSProperties;
  links: FooterLink[];
  eventPrefix: string;
  color: string;
  locale: string;
  streamDocument: StreamDocument;
}) => (
  <div className="flex min-w-0 flex-1 basis-[200px] flex-col gap-4 lg:max-w-[346px]">
    <EntityField
      displayName={`${displayName} Title`}
      fieldId={titleField.field}
      constantValueEnabled={titleField.constantValueEnabled}
    >
      <h2 className="m-0 leading-[26.4px]" style={titleStyle}>
        {title}
      </h2>
    </EntityField>
    {links.map((link, index) => {
      const label =
        resolveComponentData(link.label, locale, streamDocument) ||
        (typeof link.label.constantValue === "string"
          ? link.label.constantValue
          : link.label.constantValue?.defaultValue) ||
        "";
      const href =
        resolveComponentData(link.link, locale, streamDocument) ||
        (typeof link.link.constantValue === "string"
          ? link.link.constantValue
          : link.link.constantValue?.defaultValue) ||
        "";

      return (
        <EntityField
          key={`${label}-${index}`}
          displayName={`${displayName} Link`}
          fieldId={link.label.field}
          constantValueEnabled={link.label.constantValueEnabled}
        >
          <Link
            cta={{ link: href, linkType: "URL" }}
            eventName={`${eventPrefix}-${index}`}
            className="text-[15px] leading-6 tracking-[0.25px] hover:underline"
            style={{ color }}
          >
            {label}
          </Link>
        </EntityField>
      );
    })}
  </div>
);

const Component: PuckComponent<FamilyDestinationFooterProps> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const logoText =
    resolveComponentData(props.logo.text, locale, streamDocument) || "";
  const websiteUrl =
    resolveComponentData(props.websiteUrl, locale, streamDocument) || "";
  const resolvedAddress = resolveComponentData(
    props.address.address,
    locale,
    streamDocument,
  );
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const locationInfoStyle = resolveStyledTextStyles(
    props.address.styles.styles,
    props.address.styles?.fontColor,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const quickLinksColor =
    getThemeColorCssValue(props.quickLinks?.fontColor) ?? sectionForeground;
  const socialLinksColor =
    getThemeColorCssValue(props.socialLinks?.fontColor) ?? sectionForeground;
  const quickLinksTitle =
    resolveComponentData(props.quickLinks.title.text, locale, streamDocument) ||
    "";
  const socialLinksTitle =
    resolveComponentData(
      props.socialLinks.title.text,
      locale,
      streamDocument,
    ) || "";
  const quickLinksTitleStyle = resolveStyledTextStyles(
    props.quickLinks.title.styles,
    props.quickLinks.title?.fontColor,
    quickLinksColor,
    "var(--fontFamily-h2-fontFamily)",
    "var(--fontSize-h2-fontSize)",
    "var(--fontWeight-h2-fontWeight)",
  );
  const socialLinksTitleStyle = resolveStyledTextStyles(
    props.socialLinks.title.styles,
    props.socialLinks.title?.fontColor,
    socialLinksColor,
    "var(--fontFamily-h2-fontFamily)",
    "var(--fontSize-h2-fontSize)",
    "var(--fontWeight-h2-fontWeight)",
  );
  const resolvedPhoneItems = (props.phone.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const resolvedLabel = item.label
        ? resolveComponentData(item.label, locale, streamDocument)
        : "";
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const normalizedLabel =
        typeof resolvedLabel === "string" ? resolvedLabel.trim() : "";

      if (!normalizedNumber) {
        return null;
      }

      return {
        label: normalizedLabel,
        labelField: item.label,
        numberField: item.number,
        originalNumber: normalizedNumber,
        formattedNumber: formatPhoneValue(
          normalizedNumber,
          props.phone.phoneFormat,
        ),
        telDigits: normalizedNumber.replace(/\D/g, ""),
      };
    })
    .filter(
      (
        item,
      ): item is {
        label: string;
        labelField: YextEntityField<TranslatableString> | undefined;
        numberField: YextEntityField<string>;
        originalNumber: string;
        formattedNumber: string;
        telDigits: string;
      } => item !== null,
    );
  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationFooter${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="footer"
          background={props.section.backgroundColor}
          className="yext-family-destination-footer px-5 py-10 lg:px-12 lg:py-20"
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          <div className="flex flex-col gap-10 lg:flex-row lg:flex-nowrap lg:justify-between lg:gap-8">
            <div className="flex min-w-0 flex-1 basis-1/3 flex-col gap-5 lg:max-w-[346px]">
              <EntityField
                displayName="Name"
                fieldId={props.logo.text.field}
                constantValueEnabled={props.logo.text.constantValueEnabled}
              >
                <span
                  className="leading-none"
                  style={resolveStyledTextStyles(
                    props.logo.styles,
                    props.logo?.fontColor,
                    sectionForeground,
                    "var(--fontFamily-h4-fontFamily), Georgia, serif",
                    "var(--fontSize-h4-fontSize)",
                    "var(--fontWeight-h4-fontWeight)",
                  )}
                >
                  {logoText}
                </span>
              </EntityField>
              <div className="flex flex-col gap-2.5">
                {resolvedAddress ? (
                  <EntityField
                    displayName="Address"
                    fieldId={props.address.address.field}
                    constantValueEnabled={
                      props.address.address.constantValueEnabled
                    }
                  >
                    <div
                      className="leading-6 tracking-[0.25px]"
                      style={locationInfoStyle}
                    >
                      <Address
                        address={resolvedAddress}
                        showRegion={props.address.showRegion}
                        showCountry={props.address.showCountry}
                      />
                    </div>
                  </EntityField>
                ) : null}
                {resolvedPhoneItems.map((item, index) => {
                  const content = (
                    <>
                      {item.label && item.labelField ? (
                        <>
                          <EntityField
                            displayName="Phone Label"
                            fieldId={item.labelField.field}
                            constantValueEnabled={
                              item.labelField.constantValueEnabled
                            }
                            className="inline"
                          >
                            <span>{item.label}</span>
                          </EntityField>{" "}
                        </>
                      ) : null}
                      <EntityField
                        displayName="Phone Number"
                        fieldId={item.numberField.field}
                        constantValueEnabled={
                          item.numberField.constantValueEnabled
                        }
                        className="inline"
                      >
                        <span>{item.formattedNumber}</span>
                      </EntityField>
                    </>
                  );

                  return props.phone.includeHyperlink ? (
                    <Link
                      key={`${item.originalNumber}-${index}`}
                      cta={{
                        link: item.telDigits,
                        linkType: "PHONE",
                      }}
                      className="leading-6 tracking-[0.25px] underline"
                      style={locationInfoStyle}
                    >
                      {content}
                    </Link>
                  ) : (
                    <p
                      key={`${item.originalNumber}-${index}`}
                      className="m-0 leading-6 tracking-[0.25px]"
                      style={locationInfoStyle}
                    >
                      {content}
                    </p>
                  );
                })}
                {websiteUrl ? (
                  <EntityField
                    displayName="Website URL"
                    fieldId={props.websiteUrl.field}
                    constantValueEnabled={props.websiteUrl.constantValueEnabled}
                  >
                    <Link
                      cta={{ link: websiteUrl, linkType: "URL" }}
                      eventName="websiteUrl"
                      className="break-all leading-6 tracking-[0.25px] underline hover:opacity-80"
                      style={locationInfoStyle}
                    >
                      {websiteUrl}
                    </Link>
                  </EntityField>
                ) : null}
              </div>
            </div>
            <LinkColumn
              title={quickLinksTitle}
              titleField={props.quickLinks.title.text}
              displayName="Quick Links"
              titleStyle={quickLinksTitleStyle}
              links={props.quickLinks.data ?? []}
              eventPrefix="quickLink"
              color={quickLinksColor}
              locale={locale}
              streamDocument={streamDocument}
            />
            <LinkColumn
              title={socialLinksTitle}
              titleField={props.socialLinks.title.text}
              displayName="Social Links"
              titleStyle={socialLinksTitleStyle}
              links={props.socialLinks.data ?? []}
              eventPrefix="socialLink"
              color={socialLinksColor}
              locale={locale}
              streamDocument={streamDocument}
            />
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationFooter: YextComponentConfig<FamilyDestinationFooterProps> =
  {
    label: "Footer",
    fields: toPuckFields(fields),
    defaultProps: {
      logo: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "[[name]]",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      address: {
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
        styles: defaultSharedTextStyle,
      },
      phone: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "",
              constantValueEnabled: false,
            },
            label: createTextField(""),
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      websiteUrl: createTextField(
        "https://www.grandviewsuites.com/locations/downtown-savannah",
      ),
      quickLinks: {
        title: {
          text: createTextField("Quick Links"),
          styles: defaultTextStyles,
          fontColor: undefined,
        },
        data: [
          {
            label: createTextField("Accommodations"),
            link: createTextField("#"),
          },
          { label: createTextField("Amenities"), link: createTextField("#") },
          {
            label: createTextField("Special Offers"),
            link: createTextField("#"),
          },
          { label: createTextField("Careers"), link: createTextField("#") },
          { label: createTextField("Contact"), link: createTextField("#") },
        ],
        fontColor: undefined,
      },
      socialLinks: {
        title: {
          text: createTextField("Social Links"),
          styles: defaultTextStyles,
          fontColor: undefined,
        },
        data: [
          { label: createTextField("Instagram"), link: createTextField("#") },
          { label: createTextField("Facebook"), link: createTextField("#") },
          { label: createTextField("Pinterest"), link: createTextField("#") },
          { label: createTextField("LinkedIn"), link: createTextField("#") },
        ],
        fontColor: undefined,
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
  id: "FamilyDestinationFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
