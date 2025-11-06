"use server";
import puppeteer, { Browser, Page } from "puppeteer";
import { cleanText } from "./typingUtils";

interface WikiLesson {
  id: number;
  name: string;
  text: string;
}

interface ScrapingConfig {
  maxLessons: number;
  minWords: number;
  maxWords: number;
  timeout: number;
}

const DEFAULT_CONFIG: ScrapingConfig = {
  maxLessons: 10,
  minWords: 100,
  maxWords: 200,
  timeout: 30000,
};

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

export async function getWikiLessonsV3(
  config: Partial<ScrapingConfig> = {},
): Promise<WikiLesson[]> {
  const category = getRandomCategory();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(finalConfig.timeout);

    // 1. Get article links
    const articleLinks = await getArticleLinks(page, category);
    if (articleLinks.length === 0) {
      return [];
    }

    // 2. Select random articles
    const selectedLinks = selectRandomLinks(
      articleLinks,
      finalConfig.maxLessons,
    );

    // 3. Scrape articles in parallel với giới hạn concurrency
    const lessons = await scrapeArticles(browser, selectedLinks, finalConfig);

    return lessons.filter((lesson) => lesson.text.length > 0);
  } finally {
    await browser.close();
  }
}

// Helper functions
async function getArticleLinks(
  page: Page,
  category: string,
): Promise<string[]> {
  const categoryUrl = `https://en.wikipedia.org/wiki/Category:${encodeURIComponent(category.replace(/ /g, "_"))}`;

  try {
    await page.goto(categoryUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    return await page.evaluate(() => {
      const links: string[] = [];
      const elements = document.querySelectorAll(
        "#mw-pages .mw-category-group ul li a, .mw-category-generated li a",
      );

      elements.forEach((el) => {
        const href = el.getAttribute("href");
        if (href && href.startsWith("/wiki/") && !href.includes(":")) {
          links.push(href);
        }
      });
      return links;
    });
  } catch (error) {
    console.error(`Error getting links for category ${category}:`, error);
    return [];
  }
}

function selectRandomLinks(links: string[], maxCount: number): string[] {
  const shuffled: string[] = [...links];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] as [string, string];
  }
  return shuffled.slice(0, Math.min(maxCount, shuffled.length));
}

async function scrapeArticles(
  browser: Browser,
  links: string[],
  config: ScrapingConfig,
): Promise<WikiLesson[]> {
  const promises = links.map(async (link, index) => {
    try {
      return await scrapeSingleArticle(browser, link, index + 1, config);
    } catch (error) {
      console.error(`Error scraping article ${link}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((lesson): lesson is WikiLesson => lesson !== null);
}

async function scrapeSingleArticle(
  browser: Browser,
  link: string,
  id: number,
  config: ScrapingConfig,
): Promise<WikiLesson | null> {
  const page = await browser.newPage();

  try {
    await page.setDefaultTimeout(config.timeout);

    const articleUrl = `https://en.wikipedia.org${link}`;
    await page.goto(articleUrl, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    const { name, fullText } = await page.evaluate(() => {
      // Get title
      const title =
        document.querySelector("#firstHeading")?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim() ||
        "Unknown";

      // Get content paragraphs (exclude tables, references, etc.)
      const contentElement = document.querySelector(
        "#mw-content-text .mw-parser-output",
      );
      if (!contentElement) return { name: title, fullText: "" };

      const paragraphs = Array.from(contentElement.querySelectorAll("p"));
      let text = "";

      for (const p of paragraphs) {
        // Skip empty paragraphs and special content
        if (
          p.classList.contains("mw-empty-elt") ||
          p.querySelector(".reference") ||
          p.textContent?.trim().length === 0
        ) {
          continue;
        }

        const pText = p.textContent?.trim() || "";
        if (pText) {
          text += pText + " ";
          // Stop if we have enough content
          if (text.split(/\s+/).length >= 300) break;
        }
      }

      return { name: title, fullText: text.trim() };
    });

    // Validate and process text
    const words = fullText.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < config.minWords) {
      return null; // Skip articles that are too short
    }

    const wordCount = Math.min(
      Math.floor(Math.random() * (config.maxWords - config.minWords + 1)) +
        config.minWords,
      words.length,
    );

    const targetText = words.slice(0, wordCount).join(" ");
    const cleanedText = cleanText(targetText);

    return {
      id,
      name,
      text: cleanedText,
    };
  } catch (error) {
    console.error(`Failed to scrape article ${link}:`, error);
    return null;
  } finally {
    await page.close();
  }
}
