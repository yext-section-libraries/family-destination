import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
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
} from "@yext/visual-editor";

const typographyStyles = `
.yext-family-destination-reviews p,
.yext-family-destination-reviews li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-reviews h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-reviews h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-reviews h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-reviews h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-reviews h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-reviews h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-reviews) a {
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

const fields: YextFields<FamilyDestinationReviewsProps> = {
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
  reviewCard: {
    label: "Review Card",
    type: "object",
    objectFields: {
      stars: {
        label: "Stars",
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
      reviewText: {
        label: "Review Text",
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
      reviewName: {
        label: "Review Name",
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
                {rating.toFixed(1).replace(/\.0$/, "")} / 5 stars
              </span>
              <StarRow rating={rating} style={starsStyle} />
              <span style={starsStyle}>
                from {count.toLocaleString()} guest reviews
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
                    <span>{review.rating ?? 5} / 5 stars</span>
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
    fields: toPuckFields(fields),
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
