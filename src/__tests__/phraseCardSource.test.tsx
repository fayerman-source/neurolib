import { describe, test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import PhraseCard from "@/components/PhraseCard";
import { DotPhrase } from "@/data/dotPhrases";

const basePhrase: DotPhrase = {
  id: "sample-stroke",
  name: "Sample Stroke Note",
  trigger: ".samplestroke",
  category: "stroke",
  description: "Sample stroke template description",
  content: "Sample content body",
  tags: ["stroke", "sample"],
};

describe("PhraseCard source citation rendering", () => {
  test("renders phrase.source when populated", () => {
    const html = renderToStaticMarkup(
      <PhraseCard
        phrase={{
          ...basePhrase,
          source: "AHA/ASA 2019 Acute Ischemic Stroke Guidelines",
        }}
      />
    );
    expect(html).toContain("Source:");
    expect(html).toContain("AHA/ASA 2019 Acute Ischemic Stroke Guidelines");
  });

  test("omits Source label when phrase.source is undefined or whitespace", () => {
    const htmlUndefined = renderToStaticMarkup(<PhraseCard phrase={basePhrase} />);
    expect(htmlUndefined).not.toContain("Source:");

    const htmlBlank = renderToStaticMarkup(
      <PhraseCard phrase={{ ...basePhrase, source: "   " }} />
    );
    expect(htmlBlank).not.toContain("Source:");
  });
});
