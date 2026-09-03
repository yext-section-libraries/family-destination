import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
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

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type FamilyDestinationBannerProps = {
  bannerText: StyledTextProps;
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const fields: YextFields<FamilyDestinationBannerProps> = {
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
  bannerText: {
    label: "Banner Text",
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
};

const Component: PuckComponent<FamilyDestinationBannerProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBannerText =
    resolveComponentData(props.bannerText.text, locale, streamDocument) || "";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const textStyle: React.CSSProperties = {
    color:
      getThemeColorCssValue(props.bannerText?.fontColor) ?? sectionForeground,
    fontFamily:
      props.bannerText.styles.fontFamily === "default"
        ? "var(--fontFamily-h2-fontFamily)"
        : props.bannerText.styles.fontFamily,
    fontSize:
      props.bannerText.styles.fontSize === "default"
        ? "var(--fontSize-h2-fontSize)"
        : props.bannerText.styles.fontSize,
    fontWeight:
      props.bannerText.styles.fontWeight === "default"
        ? "var(--fontWeight-h2-fontWeight)"
        : props.bannerText.styles.fontWeight,
    fontStyle:
      props.bannerText.styles.fontStyle === "default"
        ? undefined
        : props.bannerText.styles.fontStyle,
    textTransform:
      props.bannerText.styles.textTransform === "default"
        ? "var(--textTransform-h2-textTransform)"
        : props.bannerText.styles.textTransform,
    lineHeight: 1.25,
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationBanner${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="px-5 py-10 text-center lg:px-12 lg:py-12"
          style={sectionStyle}
        >
          <EntityField
            displayName="Banner Text"
            fieldId={props.bannerText.text.field}
            constantValueEnabled={props.bannerText.text.constantValueEnabled}
          >
            <h2 className="mx-auto max-w-[900px]" style={textStyle}>
              {resolvedBannerText}
            </h2>
          </EntityField>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationBanner: YextComponentConfig<FamilyDestinationBannerProps> =
  {
    label: "Banner",
    fields: toPuckFields(fields),
    defaultProps: {
      bannerText: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Your Savannah Stay Starts Here",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
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
  id: "FamilyDestinationBanner",
  displayName: "Banner",
  description: "Banner",
  pageSetTypes: ["ENTITY"],
};
