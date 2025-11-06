import axios from "axios";
import * as cheerio from "cheerio";
import { cleanText } from "./typingUtils";

const WIKI_CATEGORIES = [
  "Computer_science",
  "Artificial_intelligence",
  "Mathematics",
  "Physics",
  "Biology",
  "History",
  "Philosophy",
  "Music",
  "Literature",
  "Sports",
];

function getRandomCategory(): string {
  if (WIKI_CATEGORIES.length === 0) throw new Error("No categories defined");
  const idx = Math.floor(Math.random() * WIKI_CATEGORIES.length);
  return WIKI_CATEGORIES[idx]!;
}

export async function getWikiLessonsV2(): Promise<
  { id: number; name: string; text: string }[]
> {
  const category = getRandomCategory();
  const categoryUrl = `https://en.wikipedia.org/wiki/Category:${category}`;

  const { data: categoryHtml } = await axios.get(categoryUrl);
  const $ = cheerio.load(categoryHtml);

  const articleLinks = $("#mw-pages li a")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter((href) => href && href.startsWith("/wiki/"));

  if (articleLinks.length === 0) throw new Error("No articles found");

  const selectedLinks = articleLinks
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const lessons = [];
  for (let i = 0; i < selectedLinks.length; i++) {
    const articleUrl = `https://en.wikipedia.org${selectedLinks[i]}`;
    const { data: articleHtml } = await axios.get(articleUrl);
    const $$ = cheerio.load(articleHtml);

    const title = $$("#firstHeading").text().trim() || "Unknown";

    let text = "";
    $$("#mw-content-text .mw-parser-output > p").each((_, p) => {
      const pText = $$(p).text().trim();
      if (pText) {
        text += pText + " ";
        if (text.split(" ").length >= 200) return false;
      }
    });

    const words = text.split(/\s+/);
    const targetText = words
      .slice(0, Math.floor(Math.random() * 101) + 100)
      .join(" ");

    lessons.push({ id: i + 1, name: title, text: cleanText(targetText) });
  }

  return lessons;
}
