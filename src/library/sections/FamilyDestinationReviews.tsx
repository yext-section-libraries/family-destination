import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import {
  Background,
  EntityField,
  getAggregateRating,
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
  msg,
} from "@yext/visual-editor";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-reviews");

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type Review = { authorName?: string; rating?: number; content?: string };
type StreamDocumentWithReviews = {
  locale?: string;
  ref_reviewsAgg?: { publisher?: string; topReviews?: Review[] }[];
};

export type FamilyDestinationReviewsProps = {
  heading: StyledTextProps;
  reviewCard: {
    stars: SharedTextStyleProps;
    reviewText: SharedTextStyleProps;
    reviewName: SharedTextStyleProps;
  };
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};



const fields: YextFields<FamilyDestinationReviewsProps> = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  reviewCard: {
    label: msg("fields.reviewCard", "Review Card"),
    type: "object",
    objectFields: {
      stars: {
        label: msg("fields.stars", "Stars"),
        type: "object",
        objectFields: {
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      reviewText: {
        label: msg("fields.reviewText", "Review Text"),
        type: "object",
        objectFields: {
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      reviewName: {
        label: msg("fields.reviewName", "Review Name"),
        type: "object",
        objectFields: {
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
    },
  },
};

const StarRow = ({
  rating,
  style,
}: {
  rating: number;
  style?: React.CSSProperties;
}) => (
  <span
    className="inline-flex items-center gap-0.5"
    style={style}
    aria-hidden="true"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <span key={index}>{rating >= index + 1 ? "★" : "☆"}</span>
    ))}
  </span>
);

const sampleReviews: Review[] = [
  {
    authorName: "Sample Guest",
    rating: 5,
    content: "A sample review shown only while editing this component.",
  },
  {
    authorName: "Sample Traveler",
    rating: 4,
    content: "Real first-party reviews replace these cards on live pages.",
  },
  {
    authorName: "Sample Visitor",
    rating: 5,
    content: "Connect review aggregate data to preview the live experience.",
  },
];

const Component: PuckComponent<FamilyDestinationReviewsProps> = (props) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<StreamDocumentWithReviews>();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstParty = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstParty?.topReviews ?? [];
  const displayedReviews = reviews.length
    ? reviews
    : props.puck.isEditing
      ? sampleReviews
      : [];

  const rating = typeof averageRating === "number" ? averageRating : 4.8;
  const count =
    typeof reviewCount === "number" && reviewCount > 0 ? reviewCount : 1248;
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const headingForeground =
    getThemeColorCssValue(props.heading?.fontColor) ?? sectionForeground;
  const reviewCardBorderColor = sectionForeground;
  const starsStyle = resolveStyledTextStyles(
    props.reviewCard.stars.styles,
    props.reviewCard.stars?.fontColor,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const reviewTextStyle = resolveStyledTextStyles(
    props.reviewCard.reviewText.styles,
    props.reviewCard.reviewText?.fontColor,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );
  const reviewNameStyle = resolveStyledTextStyles(
    props.reviewCard.reviewName.styles,
    props.reviewCard.reviewName?.fontColor,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
  );

  if (!displayedReviews.length) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`FamilyDestinationReviews${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-reviews flex flex-col items-start gap-10 px-5 py-10 lg:items-center lg:gap-8 lg:px-12 lg:py-20"
          style={sectionStyle}
        >
          <style>{typographyStyles}</style>
          <EntityField
            displayName="Heading"
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2
              className="m-0 w-full lg:text-center"
              style={resolveStyledTextStyles(
                props.heading.styles,
                props.heading?.fontColor,
                headingForeground,
                "var(--fontFamily-h2-fontFamily)",
                "var(--fontSize-h2-fontSize)",
                "var(--fontWeight-h2-fontWeight)",
              )}
            >
              {heading}
            </h2>
          </EntityField>
          <div className="flex w-full flex-col items-start gap-5 lg:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5">
              <span style={starsStyle}>
                {t("ratingInStars", {
                  defaultValue: "{{rating}} / 5 Stars",
                  rating: rating.toFixed(1).replace(/\.0$/, ""),
                })}
              </span>
              <StarRow rating={rating} style={starsStyle} />
              <span style={starsStyle}>
                {t("guestReviews", {
                  defaultValue: "{{count}} guest reviews",
                  count,
                })}
              </span>
            </div>
            <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row">
              {displayedReviews.slice(0, 3).map((review, index) => (
                <article
                  key={`${review.authorName}-${index}`}
                  className="flex flex-1 flex-col items-start gap-5 border p-5 lg:p-6"
                  style={{ borderColor: reviewCardBorderColor }}
                >
                  <div
                    className="flex min-h-[22.4px] items-center gap-2"
                    style={starsStyle}
                  >
                    <span>
                      {t("ratingInStars", {
                        defaultValue: "{{rating}} / 5 Stars",
                        rating: review.rating ?? 5,
                      })}
                    </span>
                    <StarRow rating={review.rating ?? 5} style={starsStyle} />
                  </div>
                  <p
                    className="m-0 flex-1 leading-[22px]"
                    style={{ ...reviewTextStyle, lineHeight: "22px" }}
                  >
                    {review.content}
                  </p>
                  <p
                    className="m-0 leading-[22px]"
                    style={{ ...reviewNameStyle, lineHeight: "22px" }}
                  >
                    - {review.authorName}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FamilyDestinationReviews: YextComponentConfig<FamilyDestinationReviewsProps> =
  {
    label: "Reviews",
    fields: toPuckFields<FamilyDestinationReviewsProps>(fields),
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "What Guests Are Saying",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      reviewCard: {
        stars: {
          styles: defaultTextStyles,
          fontColor: undefined,
        },
        reviewText: {
          styles: defaultTextStyles,
          fontColor: undefined,
        },
        reviewName: {
          styles: defaultTextStyles,
          fontColor: undefined,
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
  id: "FamilyDestinationReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
