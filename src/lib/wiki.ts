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
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const categoryUrl = `https://en.wikipedia.org/wiki/Category:${encodeURIComponent(
      category.replace(/ /g, "_"),
    )}`;

    await page.setUserAgent({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    await page.goto(categoryUrl, { waitUntil: "networkidle2" });

    // Lấy danh sách link bài viết
    const articleLinks = await page.$$eval(
      "#mw-pages .mw-category-group ul li a",
      (elements) =>
        elements
          .map((el) => el.getAttribute("href"))
          .filter(
            (href): href is string => !!href && href.startsWith("/wiki/"),
          ),
    );

    if (articleLinks.length === 0) {
      throw new Error("No articles found in the category");
    }

    // Chọn ngẫu nhiên tối đa 10 link
    const selectedLinks = articleLinks
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, articleLinks.length));

    // Hàm lấy nội dung từ một bài viết
    const scrapeArticle = async (
      url: string,
      id: number,
    ): Promise<WikiLesson> => {
      await page.goto(`https://en.wikipedia.org${url}`, {
        waitUntil: "networkidle2",
      });

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
            if (text.split(" ").length >= 200) break;
          }
        }
        return { name: title, fullText: text.trim() };
      });

      // Random 100–200 từ
      const words = fullText.split(/\s+/);
      const targetText = words
        .slice(0, Math.floor(Math.random() * 101) + 100)
        .join(" ");

      return {
        id,
        name,
        text: cleanText(targetText),
      };
    };

    // Dùng Promise.all để scrape song song
    const lessons = await Promise.all(
      selectedLinks.map((link, i) => scrapeArticle(link, i + 1)),
    );

    return lessons;
  } catch (error) {
    console.error("Error scraping Wikipedia:", error);
    return [];
  } finally {
    await browser.close();
  }
}
