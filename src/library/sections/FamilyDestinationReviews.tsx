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
  pt,
} from "@yext/visual-editor";
import { formatRating, getLocalizedCountOptions } from "../shared/localization";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-reviews");

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
};

type SharedTextStyleProps = {
  styles: StyledTextValue;
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
        includeColor: true,
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
            includeColor: true,
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
            includeColor: true,
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
            includeColor: true,
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
  const { t, i18n } = useTranslation();
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
    getThemeColorCssValue(props.heading?.styles.color) ?? sectionForeground;
  const reviewCardBorderColor = sectionForeground;
  const starsStyle = resolveStyledTextStyles(
    props.reviewCard.stars.styles,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
    "var(--textTransform-body-textTransform)",
  );
  const reviewTextStyle = resolveStyledTextStyles(
    props.reviewCard.reviewText.styles,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
    "var(--textTransform-body-textTransform)",
  );
  const reviewNameStyle = resolveStyledTextStyles(
    props.reviewCard.reviewName.styles,
    sectionForeground,
    "var(--fontFamily-body-fontFamily)",
    "var(--fontSize-body-fontSize)",
    "var(--fontWeight-body-fontWeight)",
    "var(--textTransform-body-textTransform)",
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
            displayName={pt("fields.heading", "Heading")}
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2
              className="m-0 w-full lg:text-center"
              style={resolveStyledTextStyles(
                props.heading.styles,
                headingForeground,
                "var(--fontFamily-h2-fontFamily)",
                "var(--fontSize-h2-fontSize)",
                "var(--fontWeight-h2-fontWeight)",
                "var(--textTransform-h2-textTransform)",
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
                  rating: formatRating(rating, i18n.language),
                })}
              </span>
              <StarRow rating={rating} style={starsStyle} />
              <span style={starsStyle}>
                {t("guestReviews", {
                  defaultValue: "{{count}} guest reviews",
                  ...getLocalizedCountOptions(count, i18n.language),
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
                        rating: formatRating(review.rating ?? 5, i18n.language),
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
    label: msg("components.reviews", "Reviews"),
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
      },
      reviewCard: {
        stars: {
          styles: defaultTextStyles,
        },
        reviewText: {
          styles: defaultTextStyles,
        },
        reviewName: {
          styles: defaultTextStyles,
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
