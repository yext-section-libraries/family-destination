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
  type TranslatableRichText,
  type TranslatableString,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import {
  createCta,
  createRichTextField as createRichTextFieldDefault,
  createTextField as createStringFieldDefault,
} from "../shared/sectionDefaults";
import { aspectRatioOptions } from "../shared/fieldOptions";
import { hasImageSource } from "../shared/imageUtils";

import {
  defaultTextStyles,
  getScopedTypographyCss,
  renderRichText,
  resolveStyledTextStyles,
} from "../shared/sectionStyles";

const typographyStyles = getScopedTypographyCss("yext-family-destination-blog");

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
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type AuthoredComprehensiveCTAValue = Omit<ComprehensiveCTAValue, "sx"> & {
  sx?: Record<string, unknown>;
};

type BlogItemProps = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: AuthoredComprehensiveCTAValue;
  image: ImageField["image"];
};

type BlogStyles = {
  itemHeading: SharedTextStyleProps;
  itemDescription: SharedTextStyleProps;
  image: Omit<ImageField, "image">;
};

const placeholder =
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg";


const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
};

const defaultSharedTextStyle: SharedTextStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
};






const createImageDefault = (url: string): ImageField["image"] => ({
  field: "",
  constantValue: {
    url,
    width: 1267,
    height: 1900,
  },
  constantValueEnabled: true,
});

const createCtaDefault = (label: string): AuthoredComprehensiveCTAValue =>
  createCta({ label, variant: "link", includeCaret: "none" });

const blogItemsSource = createItemSource<BlogItemProps>({
  label: "Articles",
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
    cta: {
      label: "Call to Action",
      type: "comprehensiveCTA",
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
  },
  defaultValues: [
    {
      title: createStringFieldDefault(
        "48 Hours in [[address.city]]: The Ultimate Weekend Itinerary",
      ),
      description: createRichTextFieldDefault(
        "Discover how to make the most of a short trip, from sunrise walks under moss-draped oaks to candlelit southern dinners.",
      ),
      cta: createCtaDefault("Read Article"),
      image: createImageDefault(placeholder),
    },
    {
      title: createStringFieldDefault(
        "Hidden Gems: The Best Boutique Shops and Cafes Near [[address.line1]]",
      ),
      description: createRichTextFieldDefault(
        "Skip the tourist traps. Our local concierge team shares their favorite local boutiques, bookstores, and artisan coffee shops.",
      ),
      cta: createCtaDefault("Read Article"),
      image: createImageDefault(
        "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
      ),
    },
  ],
});

export type FamilyDestinationBlogProps = {
  heading: StyledTextProps;
  articles: {
    data: Parameters<typeof blogItemsSource.resolveItems>[0];
    styles: BlogStyles;
  };
  section: { visibleOnLivePage: boolean; backgroundColor: ThemeColor };
};

const fields: YextFields<FamilyDestinationBlogProps> = {
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
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  articles: {
    label: "Articles",
    type: "object",
    objectFields: {
      data: blogItemsSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          itemHeading: {
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
          image: {
            label: "Image",
            type: "object",
            objectFields: {
              aspectRatio: {
                label: "Aspect Ratio",
                type: "basicSelector",
                options: aspectRatioOptions,
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

const ArticleImage = ({
  image,
  styles,
}: {
  image: ImageType | ComplexImageType | TranslatableAssetImage;
  styles: BlogStyles["image"];
}) => {
  const wrapperStyle: React.CSSProperties = {
    aspectRatio: styles.aspectRatio > 0 ? styles.aspectRatio : undefined,
    borderRadius:
      styles.styles?.borderRadius === "default"
        ? undefined
        : styles.styles?.borderRadius,
    overflow:
      styles.imageConstrain === "filled" ||
      Boolean(
        styles.styles?.borderRadius && styles.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };

  return (
    <div className="w-full" style={wrapperStyle}>
      <Image
        image={image}
        className="h-full w-full"
        style={{
          display: "block",
          width: "100%",
          height: styles.aspectRatio > 0 ? "100%" : "auto",
          objectFit: styles.imageConstrain === "filled" ? "cover" : "contain",
        }}
      />
    </div>
  );
};

const Component: PuckComponent<FamilyDestinationBlogProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const articles = blogItemsSource.resolveItems(
    props.articles.data,
    streamDocument,
  );
  const authoredArticles = props.articles.data?.constantValue ?? [];
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
        name={`FamilyDestinationBlog${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="yext-family-destination-blog flex flex-col items-stretch gap-10 overflow-hidden px-5 py-10 lg:items-center lg:gap-8 lg:px-12 lg:py-20"
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
            displayName="Articles"
            fieldId={props.articles.data?.field}
            constantValueEnabled={props.articles.data?.constantValueEnabled}
            className="flex w-full flex-col gap-8"
          >
            {articles.map((article, index) => {
              const authoredArticle = authoredArticles[index];
              const resolvedArticleImage = isLocalizedAssetImage(article.image)
                ? resolveLocalizedAssetImage(article.image, locale)
                : article.image;
              const articleImage = hasImageSource(resolvedArticleImage)
                ? resolvedArticleImage
                : undefined;
              const hasArticleImage = Boolean(articleImage);
              const title = article.title
                ? resolveComponentData(article.title, locale)
                : "";
              const description = authoredArticle?.description
                ? resolveComponentData(
                    authoredArticle.description,
                    locale,
                    streamDocument,
                  )
                : null;

              return (
                <article
                  key={`${index}`}
                  className={`flex w-full flex-col items-stretch gap-5 ${
                    hasArticleImage
                      ? "lg:flex-row lg:items-center lg:gap-10"
                      : ""
                  } ${hasArticleImage && index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="flex flex-1 flex-col gap-2.5">
                    <h3
                      className="m-0"
                      style={resolveStyledTextStyles(
                        props.articles.styles.itemHeading.styles,
                        props.articles.styles.itemHeading?.fontColor,
                        sectionForeground,
                        "var(--fontFamily-h3-fontFamily)",
                        "var(--fontSize-h3-fontSize)",
                        "var(--fontWeight-h3-fontWeight)",
                      )}
                    >
                      {title}
                    </h3>
                    <div
                      style={{
                        ...resolveStyledTextStyles(
                          props.articles.styles.itemDescription.styles,
                          props.articles.styles.itemDescription?.fontColor,
                          sectionForeground,
                          "var(--fontFamily-body-fontFamily)",
                          "var(--fontSize-body-fontSize)",
                          "var(--fontWeight-body-fontWeight)",
                        ),
                        lineHeight: "26px",
                      }}
                    >
                      {renderRichText(description, {
                        ...props.articles.styles.itemDescription.styles,
                        color:
                          getThemeColorCssValue(
                            props.articles.styles.itemDescription?.fontColor,
                          ) ?? sectionForeground,
                      })}
                    </div>
                    {authoredArticle?.cta ? (
                      <EntityField
                        displayName="Article Call to Action"
                        fieldId={authoredArticle.cta.data.cta.field}
                        constantValueEnabled={
                          authoredArticle.cta.data.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          value={{
                            data: authoredArticle.cta.data,
                            styles: authoredArticle.cta.styles,
                            className: authoredArticle.cta.className,
                            eventName: authoredArticle.cta.eventName,
                          }}
                          eventName={`articleCta-${index}`}
                          className={
                            authoredArticle.cta.styles?.variant === "link"
                              ? "inline-flex min-h-12 w-max max-w-full items-center self-start border-b border-current py-4 text-base font-bold leading-5 tracking-[0.16px] no-underline transition-colors hover:text-[var(--colors-palette-secondary)] focus-visible:text-[var(--colors-palette-secondary)]"
                              : undefined
                          }
                        />
                      </EntityField>
                    ) : null}
                  </div>
                  {articleImage ? (
                    <figure className="m-0 flex-1 overflow-hidden">
                      <ArticleImage
                        image={articleImage}
                        styles={props.articles.styles.image}
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

export const FamilyDestinationBlog: YextComponentConfig<FamilyDestinationBlogProps> =
  {
    label: "Blog",
    fields: toPuckFields<FamilyDestinationBlogProps>(fields),
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "From the Blog: [[address.city]] Travel Guide",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      articles: {
        data: blogItemsSource.defaultValue,
        styles: {
          itemHeading: defaultSharedTextStyle,
          itemDescription: defaultSharedTextStyle,
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
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: (props) => <Component {...props} />,
  };

export const config: SectionConfig = {
  id: "FamilyDestinationBlog",
  displayName: "Blog",
  description: "Blog",
  pageSetTypes: ["ENTITY"],
};
