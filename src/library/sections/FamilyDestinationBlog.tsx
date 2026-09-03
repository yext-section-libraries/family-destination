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
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  isLocalizedAssetImage,
  MaybeRTF,
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

const typographyStyles = `
.yext-family-destination-blog p,
.yext-family-destination-blog li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yext-family-destination-blog h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yext-family-destination-blog h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yext-family-destination-blog h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yext-family-destination-blog h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yext-family-destination-blog h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yext-family-destination-blog h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
:where(.yext-family-destination-blog) a {
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

const defaultSharedTextStyle: SharedTextStyleProps = {
  styles: defaultTextStyles,
  fontColor: undefined,
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

const createStringFieldDefault = (
  defaultValue: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createRichTextFieldDefault = (
  defaultValue: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(defaultValue),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
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

const createImageDefault = (url: string): ImageField["image"] => ({
  field: "",
  constantValue: {
    url,
    width: 1267,
    height: 1900,
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
      ...{ showIncludeCaretField: false },
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
              const title = resolveTranslatableString(article.title, locale);
              const description = authoredArticle?.description
                ? resolveComponentData(
                    authoredArticle.description,
                    locale,
                    streamDocument,
                    {
                      richTextStyleOverrides: {
                        ...props.articles.styles.itemDescription.styles,
                        color:
                          getThemeColorCssValue(
                            props.articles.styles.itemDescription?.fontColor,
                          ) ?? sectionForeground,
                      },
                    },
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
                      {React.isValidElement(description) ? (
                        description
                      ) : typeof description === "string" ||
                        (description &&
                          typeof description === "object" &&
                          "html" in description) ? (
                        <MaybeRTF
                          data={description as string | { html: string }}
                        />
                      ) : null}
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
    fields: toPuckFields(fields),
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
