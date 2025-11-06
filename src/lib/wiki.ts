// wiki.ts
"use server";
import puppeteer from "puppeteer";
import { cleanText } from "./typingUtils";

interface WikiLesson {
  id: number;
  name: string;
  text: string;
}

export async function getWikiLessons(category: string): Promise<WikiLesson[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Tạo URL cho category trên Wikipedia (giả sử English Wikipedia)
    const categoryUrl = `https://en.wikipedia.org/wiki/Category:${encodeURIComponent(category.replace(/ /g, "_"))}`;
    await page.goto(categoryUrl, { waitUntil: "domcontentloaded" });

    // Scrape list các bài viết từ category (tìm các link trong .mw-category-generated li a)
    const articleLinks = await page.evaluate(() => {
      const links: string[] = [];
      const elements = document.querySelectorAll(
        "#mw-pages .mw-category-group ul li a",
      );
      elements.forEach((el) => {
        const href = el.getAttribute("href");
        if (href && href.startsWith("/wiki/")) {
          links.push(href);
        }
      });
      return links;
    });

    if (articleLinks.length === 0) {
      throw new Error("No articles found in the category");
    }

    // Random select 10 links (hoặc ít hơn nếu category nhỏ)
    const selectedLinks = articleLinks
      .sort(() => 0.5 - Math.random()) // Shuffle random
      .slice(0, Math.min(10, articleLinks.length));

    const lessons: WikiLesson[] = [];

    for (let i = 0; i < selectedLinks.length; i++) {
      const articleUrl = `https://en.wikipedia.org${selectedLinks[i]}`;
      await page.goto(articleUrl, { waitUntil: "domcontentloaded" });

      // Lấy title (name) và text (intro paragraph)
      const { name, fullText } = await page.evaluate(() => {
        const title =
          document.querySelector("#firstHeading")?.textContent?.trim() ||
          "Unknown";
        const paragraphs = Array.from(
          document.querySelectorAll("#mw-content-text .mw-parser-output > p"),
        );
        let text = "";
        for (const p of paragraphs) {
          const pText = p.textContent?.trim() || "";
          if (pText && !p.classList.contains("mw-empty-elt")) {
            text += pText + " ";
            if (text.split(" ").length >= 200) break; // Giới hạn để tránh quá dài
          }
        }
        return { name: title, fullText: text.trim() };
      });

      // Cắt text thành 100-200 từ
      const words = fullText.split(/\s+/);
      const targetText = words
        .slice(0, Math.floor(Math.random() * 101) + 100)
        .join(" "); // Random 100-200 từ

      // clean text

      const cleanedText = cleanText(targetText);

      lessons.push({
        id: i + 1, // ID đơn giản từ 1-10
        name,
        text: targetText,
      });
    }

    return lessons;
  } catch (error) {
    console.error("Error scraping Wikipedia:", error);
    return [];
  } finally {
    await browser.close();
  }
}
