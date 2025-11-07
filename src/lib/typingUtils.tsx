export function splitLessonToSentences(
  text: string,
  maxCharsPerSentenceGroup = 150, // đổi tên rõ nghĩa hơn
): string[] {
  // 1. Tách văn bản thành các câu
  const sentences =
    text
      .match(/[^.!?]+[.!?]*\s*/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || [];

  // 2. Gom nhiều câu thành một "sentenceGroup" (nhóm câu) theo giới hạn ký tự
  const sentenceGroups: string[] = [];
  let currentGroup = "";

  for (const sentence of sentences) {
    const lengthWithNewSentence =
      currentGroup.length === 0
        ? sentence.length
        : currentGroup.length + 1 + sentence.length;

    if (lengthWithNewSentence <= maxCharsPerSentenceGroup) {
      // thêm câu vào nhóm hiện tại
      currentGroup =
        currentGroup.length === 0 ? sentence : `${currentGroup} ${sentence}`;
    } else {
      // push nhóm hiện tại vào mảng
      if (currentGroup.length > 0) {
        sentenceGroups.push(currentGroup);
      }
      // bắt đầu nhóm mới
      currentGroup = sentence;
    }
  }

  // 3. Push nhóm cuối cùng
  if (currentGroup.length > 0) {
    sentenceGroups.push(currentGroup);
  }

  return sentenceGroups;
}

// Hàm renderPromptText hiển thị đoạn text hiện tại (currentChunk)
// với highlight cho phần đã gõ, caret nhấp nháy ở ký tự tiếp theo,
// và phần còn lại hiển thị mờ.
export const renderLesson = (currentChunk: string, userInput: string) => {
  // Lấy phần text mà user đã gõ đúng
  const beforeCaret = currentChunk.slice(0, userInput.length);

  // Lấy ký tự tiếp theo (caret sẽ nằm ở đây)
  const caretChar = currentChunk[userInput.length] ?? "";

  // Lấy phần text còn lại sau caret
  const afterCaret = currentChunk.slice(userInput.length + 1);

  return (
    <>
      {/* Phần đã gõ: hiển thị màu xám nhạt */}
      <span className="text-4xl text-[#8D8888]">{beforeCaret}</span>

      {/* Caret: ký tự tiếp theo, có gạch chân và hiệu ứng nhấp nháy */}
      {caretChar && (
        <span className="// hiệu ứng nhấp nháy // chỉnh tốc độ nhấp nháy // gạch chân caret // style chữ animate-pulse border-b-4 border-gray-400 text-4xl text-gray-400 [animation-duration:1.5s]">
          {/* Nếu ký tự là khoảng trắng thì render &nbsp; để giữ chỗ */}
          {caretChar === " " ? " " : caretChar}
        </span>
      )}

      {/* Phần chưa gõ: hiển thị màu xám nhạt hơn */}
      <span className="text-4xl text-gray-400">{afterCaret}</span>
    </>
  );
};

// src/lib/typingUtils.tsx (hoặc textCleaner.ts)

// Hàm clean text trước khi dùng làm lesson
export function cleanText(text: string): string {
  // Bước 1: Thay thế ký tự đặc biệt phổ biến
  text = text
    .replace(/—/g, "-") // Em dash → Hyphen
    .replace(/–/g, "-") // En dash → Hyphen
    .replace(/’/g, "'") // Curly single quote right → Straight
    .replace(/‘/g, "'") // Curly single quote left → Straight
    .replace(/“/g, '"') // Curly double quote left → Straight
    .replace(/”/g, '"') // Curly double quote right → Straight
    .replace(/…/g, "...") // Ellipsis → Ba chấm
    .replace(/\u00A0/g, " "); // Non-breaking space → Space thường

  // Bước 2: Loại bỏ ký tự không mong muốn (regex: giữ alphanumeric, space, punctuation cơ bản)
  // Chỉ giữ A-Z, a-z, 0-9, space, .,?!:;'"()- và một số khác phù hợp typing
  text = text.replace(/[^A-Za-z0-9\s.,?!:;'"()\-]/g, ""); // Thay thế bất kỳ ký tự lạ bằng rỗng

  // Bước 3: Trim khoảng trắng thừa và normalize multiple spaces
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
