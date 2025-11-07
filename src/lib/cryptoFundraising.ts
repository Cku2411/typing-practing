"use server";
import axios from "axios";
import * as cheerio from "cheerio";

// Định nghĩa cấu trúc dữ liệu cho mỗi dự án
interface ProjectData {
  projectTitle: string;
  projectInfo: string;
}

/**
 * Hàm chính để cào dữ liệu các dự án fundraising hàng tuần
 */
export async function scrapeWeeklyFundraising(): Promise<ProjectData[]> {
  const baseUrl = "https://crypto-fundraising.info";
  const blogUrl = `${baseUrl}/blog/`;
  const targetText = "Crypto Fundraising weekly"; // Từ khóa để tìm bài viết hàng tuần

  try {
    // --- Bước 1: Truy cập link blog và lấy HTML ---
    console.log(`Đang truy cập trang blog: ${blogUrl}`);
    const { data: blogHtml } = await axios.get(blogUrl);
    const $blog = cheerio.load(blogHtml);

    // --- Bước 2 & 3: Duyệt qua các postcard và tìm link bài viết tuần đầu tiên ---
    let weeklyReportUrl: string | undefined = undefined;
    const postcards = $blog("div.analytics-grid div.postcard");

    postcards.each((_i, el) => {
      const postcard = $blog(el);
      const postcardText = postcard.text();

      // Kiểm tra xem postcard có chứa text "Crypto Fundraising weekly" không
      if (postcardText.includes(targetText)) {
        // Lấy thẻ <a> đầu tiên bên trong postcard (thường là link bài viết)
        const link = postcard.find("a").attr("href");

        if (link) {
          // Xây dựng URL đầy đủ (vì link có thể là tương đối, ví dụ: /blog/post-name)
          weeklyReportUrl = new URL(link, baseUrl).href;
          return false; // Dừng vòng lặp sau khi tìm thấy link đầu tiên
        }
      }
    });

    if (!weeklyReportUrl) {
      console.error('Không tìm thấy bài viết "Crypto Fundraising weekly" nào.');
      return [];
    }

    console.log(`Đã tìm thấy link bài viết tuần: ${weeklyReportUrl}`);

    // --- Bước 4: Truy cập link bài viết tuần và lấy thông tin dự án ---
    const { data: reportHtml } = await axios.get(weeklyReportUrl);
    const $report = cheerio.load(reportHtml);

    const projects: ProjectData[] = [];
    const articleContent = $report("div.wrapper.article-content");

    // --- Bước 5: Lấy dữ liệu từ 'div.wrapper.article-content' ---
    // Giả định: Các dự án được cấu trúc với <h4> là tiêu đề dự án
    // và thẻ <p> ngay sau đó là thông tin dự án.
    // Đây là cấu trúc phổ biến trên trang này.
    articleContent.find(".round-header").each((_i, el) => {
      const titleElement = $report(el);
      const projectTitle = titleElement.text().trim();

      // Lấy thẻ <p> ngay sau thẻ <h4>
      const infoElement = titleElement.next("p");
      const projectInfo = infoElement.length ? infoElement.text().trim() : "";

      // Lọc bỏ các tiêu đề không phải dự án (ví dụ: 'Contents')
      if (
        projectTitle &&
        projectTitle.toLowerCase() !== "contents" &&
        projectInfo
      ) {
        projects.push({ projectTitle, projectInfo });
      }
    });

    console.log(`Đã cào được ${projects.length} dự án.`);
    return projects;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Lỗi Axios khi truy cập: ${error}`);
    } else {
      console.error("Đã xảy ra lỗi không xác định:", error);
    }
    return [];
  }
}
