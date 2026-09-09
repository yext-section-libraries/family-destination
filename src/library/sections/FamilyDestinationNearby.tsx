import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { Address, AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  Background,
  EntityField,
  getSurfaceColorStyle,
  getAnalyticsScopeHash,
  MapboxStaticMapComponent,
  mapboxStaticMapStyleOptions,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  type StyledTextValue,
  type ThemeColor,
  toPuckFields,
  type TranslatableString,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { createTextField } from "../shared/sectionDefaults";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-nearby");

type SharedTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledTextProps = SharedTextStyleProps & {
  text: YextEntityField<TranslatableString>;
};

type MapProps = {
  coordinate: YextEntityField<{ latitude: number; longitude: number }>;
  mapStyle: string;
  zoom: number;
};

export type FamilyDestinationNearbyProps = {
  heading: StyledTextProps;
  locationCard: {
    nearbyLocationHeading: SharedTextStyleProps;
    nearbyLocationBody: SharedTextStyleProps;
  };
  radius: number;
  limit: number;
  map: MapProps;
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};

type NearbyStreamDocument = {
  locale?: string;
  yextDisplayCoordinate?: { latitude?: number; longitude?: number };
};


const defaultSharedTextStyle: SharedTextStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};



const fields: YextFields<FamilyDestinationNearbyProps> = {
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
    label: "Section Heading",
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
  radius: { label: "Radius Miles", type: "number", min: 1, max: 100 },
  limit: { label: "Limit", type: "number", min: 1, max: 10 },
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      coordinate: {
        type: "entityField",
        label: "Coordinates",
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: "Mapbox Map Style",
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: { label: "Zoom", type: "number", min: 0, max: 22 },
    },
  },
  locationCard: {
    label: "Location Card",
    type: "object",
    objectFields: {
      nearbyLocationHeading: {
        label: "Nearby Location Heading",
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
      nearbyLocationBody: {
        label: "Nearby Location Body",
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
};

const Component: PuckComponent<FamilyDestinationNearbyProps> = (props) => {
  const streamDocument = useDocument<NearbyStreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const coordinate =
    resolveComponentData(props.map.coordinate, locale, streamDocument) ??
    streamDocument?.yextDisplayCoordinate;
  const enabled = Boolean(
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    props.radius &&
    props.limit,
  );
  const nearbyLocationsInput = React.useMemo(
    () => ({
      streamDocument,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude,
      radiusMi: props.radius,
      limit: props.limit,
      enabled,
    }),
    [
      coordinate?.latitude,
      coordinate?.longitude,
      enabled,
      props.limit,
      props.radius,
      streamDocument,
    ],
  );
  const { data, status } = useNearbyLocations(nearbyLocationsInput);
  const docs = data?.response?.docs ?? [];
  const hasNearbyLocations = docs.length > 0;
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const nearbyLocationHeadingStyle = resolveStyledTextStyles(
    props.locationCard.nearbyLocationHeading.styles,
    props.locationCard.nearbyLocationHeading?.fontColor,
    sectionForeground,
    "var(--fontFamily-h4-fontFamily)",
    "var(--fontSize-h4-fontSize)",
    "var(--fontWeight-h4-fontWeight)",
  );
  const nearbyLocationBodyStyle = resolveStyledTextStyles(
    props.locationCard.nearbyLocationBody.styles,
    props.locationCard.nearbyLocationBody?.fontColor,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const shouldShowSection = props.puck.isEditing || hasNearbyLocations;
  const shouldShowNearbyColumn = props.puck.isEditing || hasNearbyLocations;

  if (!shouldShowSection) {
    return <></>;
  }
  if (status !== "success" && !props.puck.isEditing) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationNearby${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-nearby flex flex-col items-stretch gap-8 overflow-hidden px-5 py-10 lg:items-center lg:px-12 lg:py-20"
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          <EntityField
            displayName="Heading"
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2
              className="m-0 w-full leading-10 lg:text-center"
              style={resolveStyledTextStyles(
                props.heading.styles,
                props.heading.fontColor,
                sectionForeground,
                "var(--fontFamily-h2-fontFamily)",
                "var(--fontSize-h2-fontSize)",
                "var(--fontWeight-h2-fontWeight)",
              )}
            >
              {heading}
            </h2>
          </EntityField>
          <div
            className={`flex w-full flex-col items-stretch gap-10 ${shouldShowNearbyColumn ? "lg:flex-row lg:gap-8" : ""}`}
          >
            <figure className="order-2 m-0 min-h-[472px] flex-1 overflow-hidden lg:order-1">
              <div className="h-full min-h-[472px] w-full [&_.mapbox-static-map-image]:h-full [&_.mapbox-static-map-image]:w-full [&_.mapbox-static-map-image]:object-cover [&_.mapbox-static-map-picture]:h-full [&_.mapbox-static-map-picture]:w-full [&_.mapbox-static-map-shell]:h-full [&_.mapbox-static-map-shell]:w-full">
                {enabled || props.puck.isEditing ? (
                  <EntityField
                    displayName="Map Location"
                    fieldId={props.map.coordinate.field}
                    constantValueEnabled={
                      props.map.coordinate.constantValueEnabled
                    }
                    fullHeight
                  >
                    <MapboxStaticMapComponent
                      coordinate={props.map.coordinate}
                      id={`${props.id}-map`}
                      mapStyle={props.map.mapStyle}
                      puck={props.puck}
                      zoom={props.map.zoom}
                      height={"100%"}
                    />
                  </EntityField>
                ) : null}
              </div>
            </figure>
            {shouldShowNearbyColumn ? (
              <div className="order-1 flex flex-1 flex-col gap-8 opacity-[0.819] lg:order-2">
                {status === "pending" ? (
                  <p>Loading nearby locations</p>
                ) : docs.length ? (
                  docs.map((locationData, index) => {
                    const resolvedUrl = resolveUrlTemplate(
                      mergeMeta(locationData, streamDocument),
                      relativePrefixToRoot ?? "",
                    );
                    const formattedPhone = locationData.mainPhone
                      ? formatPhoneNumber(locationData.mainPhone, "domestic")
                      : "";
                    return (
                      <React.Fragment
                        key={locationData.id ?? locationData.name ?? index}
                      >
                        <article className="flex flex-col gap-2.5">
                          <h3
                            className="m-0"
                            style={{
                              ...nearbyLocationHeadingStyle,
                              lineHeight: "2rem",
                            }}
                          >
                            {locationData.name}
                          </h3>
                          {locationData.address ? (
                            <div
                              style={{
                                ...nearbyLocationBodyStyle,
                                lineHeight: "22px",
                              }}
                            >
                              <Address
                                address={locationData.address}
                                showRegion
                                showCountry={false}
                              />
                            </div>
                          ) : null}
                          {formattedPhone ? (
                            <p
                              className="m-0"
                              style={{
                                ...nearbyLocationBodyStyle,
                                lineHeight: "22px",
                              }}
                            >
                              {formattedPhone}
                            </p>
                          ) : null}
                          <Link
                            cta={{ link: resolvedUrl, linkType: "URL" }}
                            eventName={`getDirections-${index}`}
                            className="inline-flex min-h-12 items-center self-start border-b border-current py-4 font-bold leading-5 no-underline hover:no-underline"
                          >
                            Get Directions
                          </Link>
                        </article>
                        {index < docs.length - 1 ? (
                          <hr className="m-0 border-0 border-t border-current" />
                        ) : null}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <p>No nearby locations found for this location</p>
                )}
              </div>
            ) : null}
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationNearby: YextComponentConfig<FamilyDestinationNearbyProps> =
  {
    label: "Nearby",
    fields: toPuckFields<FamilyDestinationNearbyProps>(fields),
    defaultProps: {
      heading: {
        text: createTextField("Nearby Hotels & Sister Properties"),
        ...defaultSharedTextStyle,
      },
      locationCard: {
        nearbyLocationHeading: defaultSharedTextStyle,
        nearbyLocationBody: defaultSharedTextStyle,
      },
      radius: 10,
      limit: 3,
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: { latitude: 0, longitude: 0 },
          constantValueEnabled: false,
        },
        mapStyle: "dark-v11",
        zoom: 10,
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
  id: "FamilyDestinationNearby",
  displayName: "Nearby",
  description: "Nearby",
  pageSetTypes: ["ENTITY"],
};
