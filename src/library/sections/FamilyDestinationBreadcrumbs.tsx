import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveBreadcrumbs,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  toPuckFields,
  useDocument,
  useTemplateProps,
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

type BreadcrumbsStreamDocument = {
  locale?: string;
  name?: string;
};

export type FamilyDestinationBreadcrumbsProps = {
  rootLabel: StyledTextProps;
  includeCurrentLocation: boolean;
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

const fields: YextFields<FamilyDestinationBreadcrumbsProps> = {
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
  rootLabel: {
    label: "Root Label",
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
  includeCurrentLocation: {
    label: "Include Current Location",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const Component: PuckComponent<FamilyDestinationBreadcrumbsProps> = (
  props,
) => {
  const streamDocument = useDocument<BreadcrumbsStreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const resolvedRootLabel =
    resolveComponentData(props.rootLabel.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const currentPageLabel = streamDocument.name || "";
  const visibleBreadcrumbs =
    props.includeCurrentLocation || breadcrumbs.length <= 1
      ? breadcrumbs
      : breadcrumbs.slice(0, -1);
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const rootLabelStyle: React.CSSProperties = {
    color:
      getThemeColorCssValue(props.rootLabel?.fontColor) ?? sectionForeground,
    fontFamily:
      props.rootLabel.styles.fontFamily === "default"
        ? undefined
        : props.rootLabel.styles.fontFamily,
    fontSize:
      props.rootLabel.styles.fontSize === "default"
        ? undefined
        : props.rootLabel.styles.fontSize,
    fontWeight:
      props.rootLabel.styles.fontWeight === "default"
        ? undefined
        : props.rootLabel.styles.fontWeight,
    fontStyle:
      props.rootLabel.styles.fontStyle === "default"
        ? undefined
        : props.rootLabel.styles.fontStyle,
    textTransform:
      props.rootLabel.styles.textTransform === "default"
        ? undefined
        : props.rootLabel.styles.textTransform,
  };

  if (!visibleBreadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationBreadcrumbs${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="px-5 py-4 lg:px-12"
          style={sectionStyle}
        >
          <nav aria-label="Breadcrumb">
            <ol
              className="m-0 flex list-none flex-wrap items-center gap-y-1 p-0"
              style={{
                color: sectionForeground,
                fontFamily: "var(--fontFamily-link-fontFamily)",
                fontSize: "var(--fontSize-link-fontSize)",
                fontWeight: "var(--fontWeight-link-fontWeight)",
                textTransform: "var(--textTransform-link-textTransform)",
                letterSpacing: "var(--letterSpacing-link-letterSpacing)",
              }}
            >
              {visibleBreadcrumbs.map(({ name, slug }, index) => {
                const isRoot = index === 0;
                const isCurrentPage =
                  props.includeCurrentLocation &&
                  index === breadcrumbs.length - 1;
                const href = relativePrefixToRoot
                  ? relativePrefixToRoot + slug
                  : slug;
                const label = isRoot
                  ? resolvedRootLabel || name
                  : isCurrentPage
                    ? currentPageLabel || name
                    : name;
                const breadcrumbContent = isCurrentPage ? (
                  <EntityField
                    displayName="Current Page"
                    fieldId="name"
                    constantValueEnabled={false}
                  >
                    <span
                      aria-current="page"
                      className="no-underline"
                      style={isRoot ? rootLabelStyle : undefined}
                    >
                      {label}
                    </span>
                  </EntityField>
                ) : (
                  <Link
                    href={href}
                    eventName={`breadcrumbLink-${index}`}
                    className=""
                    style={isRoot ? rootLabelStyle : undefined}
                  >
                    {label}
                  </Link>
                );

                return (
                  <li key={`${slug}-${index}`} className="flex items-center">
                    {index > 0 ? (
                      <span className="mx-2" aria-hidden="true">
                        /
                      </span>
                    ) : null}
                    <wbr />
                    {isRoot ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={props.rootLabel.text.field}
                        constantValueEnabled={
                          props.rootLabel.text.constantValueEnabled
                        }
                      >
                        {breadcrumbContent}
                      </EntityField>
                    ) : (
                      breadcrumbContent
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationBreadcrumbs: YextComponentConfig<FamilyDestinationBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: toPuckFields(fields),
    defaultProps: {
      rootLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "All Locations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      includeCurrentLocation: true,
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
  id: "FamilyDestinationBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
