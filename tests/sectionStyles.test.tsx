import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MaybeRTF,
  VisualEditorProvider,
  getDefaultRTF,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";
import {
  FamilyDestinationBanner,
  type FamilyDestinationBannerProps,
} from "../src/library/sections/FamilyDestinationBanner";
import {
  defaultTextStyles,
  renderRichText,
  resolveRichTextStyles,
  resolveStyledTextStyles,
  resolveTextColor,
} from "../src/library/shared/sectionStyles";

const color = (selectedColor: string): ThemeColor => ({
  selectedColor,
  contrastingColor: "default",
});

test("Text Styles color uses the section contrast when no color is selected", async (t) => {
  for (const { name, selected, expected } of [
    {
      name: "explicit selection",
      selected: "palette-primary",
      expected: "palette-primary",
    },
    {
      name: "default selection",
      selected: "default",
      expected: "palette-quaternary",
    },
    {
      name: "no selection",
      selected: undefined,
      expected: "palette-quaternary",
    },
  ]) {
    await t.test(name, () => {
      const styles = {
        ...defaultTextStyles,
        color: selected ? color(selected) : undefined,
      };
      assert.equal(
        resolveTextColor(styles, "palette-quaternary")?.selectedColor,
        expected,
      );
      assert.equal(
        resolveStyledTextStyles(
          styles,
          "var(--colors-palette-quaternary)",
          "inherit",
          "16px",
          "400",
        ).color,
        `var(--colors-${expected})`,
      );
    });
  }
  assert.equal(resolveTextColor(defaultTextStyles, "default"), undefined);
  assert.equal(resolveTextColor(defaultTextStyles), undefined);
  assert.deepEqual(
    resolveTextColor(defaultTextStyles, color("palette-secondary")),
    color("palette-secondary"),
  );
});

test("raw and resolved rich text preserve markup and selected typography", async (t) => {
  const data = {
    html: "<p>Paragraph <strong>bold</strong></p><ul><li>List item</li></ul>",
  };
  const styles = resolveRichTextStyles(
    {
      fontFamily: "Georgia",
      fontSize: "30px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
      color: color("palette-primary"),
    },
    color("palette-secondary"),
  );
  for (const [name, content] of [
    ["raw rich text", data],
    ["resolved rich text", <MaybeRTF data={data} />],
  ] as const) {
    await t.test(name, () => {
      const html = renderToStaticMarkup(
        renderRichText(content, styles, "custom-body"),
      );
      for (const declaration of [
        "--fontFamily-body-fontFamily:Georgia",
        "--fontSize-body-fontSize:30px",
        "--fontWeight-body-fontWeight:700",
        "--fontStyle-body-fontStyle:italic",
        "--textTransform-body-textTransform:uppercase",
        "color:var(--colors-palette-primary)",
      ]) {
        assert.ok(html.includes(declaration), declaration);
      }
      assert.ok(html.includes("custom-body"));
      assert.ok(html.includes(data.html), "preserves rich text markup");
    });
  }
});

test("default typography inherits the theme and plain text remains renderable", () => {
  const html = renderToStaticMarkup(
    renderRichText({ html: "<p>Default</p>" }, defaultTextStyles),
  );
  assert.ok(!html.includes("--fontSize-body-fontSize"));
  assert.ok(!html.includes("font-size:default"));
  assert.ok(
    renderToStaticMarkup(
      renderRichText("Plain text", defaultTextStyles),
    ).includes("Plain text"),
  );
  assert.equal(
    renderToStaticMarkup(renderRichText(undefined, defaultTextStyles)),
    "",
  );
});

test("resolved rich text inherits the section theme without a new theme scope", async (t) => {
  const data = getDefaultRTF("Section Text");
  const styles = {
    ...defaultTextStyles,
    fontSize: "32px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
  };
  const resolved = resolveComponentData(
    {
      field: "",
      constantValue: { defaultValue: data },
      constantValueEnabled: true,
    },
    "en",
    {},
  );
  for (const [name, value] of [
    ["raw rich text", data],
    ["resolved rich text", resolved],
    ["HTML string", data.html],
  ] as const) {
    await t.test(name, () => {
      const rendered = renderRichText(value, styles);
      assert.ok(React.isValidElement<{ className?: string }>(rendered));
      assert.ok(
        !rendered.props.className?.split(/\s+/).includes("components"),
        "a new .components scope resets typography variables to important theme defaults",
      );
      const html = renderToStaticMarkup(rendered);
      assert.ok(html.includes("--fontSize-body-fontSize:32px"));
      assert.ok(html.includes("--fontWeight-body-fontWeight:700"));
      assert.ok(html.includes("--textTransform-body-textTransform:uppercase"));
      assert.ok(html.includes("Section Text"));
    });
  }
});

test("Banner plain text applies selected styles and can return to theme defaults", async (t) => {
  const cases: {
    name: string;
    styles: StyledTextValue;
    declarations: string[];
  }[] = [
    {
      name: "selected styles",
      styles: {
        fontFamily: "Georgia",
        fontSize: "32px",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
        color: color("palette-secondary"),
      },
      declarations: [
        "color:var(--colors-palette-secondary)",
        "font-family:Georgia",
        "font-size:32px",
        "font-weight:700",
        "font-style:italic",
        "text-transform:uppercase",
      ],
    },
    {
      name: "theme defaults",
      styles: defaultTextStyles,
      declarations: [
        "font-family:var(--fontFamily-h2-fontFamily)",
        "font-size:var(--fontSize-h2-fontSize)",
        "font-weight:var(--fontWeight-h2-fontWeight)",
        "text-transform:var(--textTransform-h2-textTransform)",
      ],
    },
  ];
  for (const { name, styles, declarations } of cases) {
    await t.test(name, () => {
      const props: FamilyDestinationBannerProps = {
        bannerText: {
          text: {
            field: "",
            constantValue: { defaultValue: "Family trip" },
            constantValueEnabled: true,
          },
          styles,
        },
        section: {
          visibleOnLivePage: true,
          backgroundColor: color("palette-primary"),
        },
      };
      const html = renderToStaticMarkup(
        <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
          <FamilyDestinationBanner.render
            {...props}
            id="banner"
            puck={{
              isEditing: false,
              dragRef: () => {},
              renderDropZone: () => <></>,
              metadata: {},
            }}
          />
        </VisualEditorProvider>,
      );
      for (const declaration of declarations) {
        assert.ok(html.includes(declaration), declaration);
      }
      assert.ok(html.includes("Family trip"));
    });
  }
});
