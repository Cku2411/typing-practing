export function splitIntoChunksBySentences(
  text: string,
  maxCharsPerChunk = 150,
): string[] {
  // 1. Tối ưu việc tách câu:
  // Dùng `match` thay vì `split/reduce`.
  // Regex này tìm:
  // - [^.!?]+ : Bất kỳ ký tự nào KHÔNG phải là dấu kết thúc câu (1 hoặc nhiều lần)
  // - [.!?]* : Theo sau bởi 0 hoặc nhiều dấu kết thúc câu (để xử lý "...")
  // - \s* : Theo sau bởi 0 hoặc nhiều khoảng trắng (để gom cả khoảng trắng)
  // - /g      : Tìm tất cả các kết quả khớp
  const sentences =
    text
      .match(/[^.!?]+[.!?]*\s*/g)
      ?.map((s) => s.trim()) // Cắt bỏ khoảng trắng thừa ở đầu/cuối mỗi câu
      .filter(Boolean) || []; // Lọc bỏ các chuỗi rỗng (nếu có)

  // 2. Tối ưu logic chia chunk (làm cho dễ đọc hơn):
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    // Tính toán độ dài nếu thêm câu mới (bao gồm cả 1 dấu cách)
    const lengthWithNewSentence =
      currentChunk.length === 0
        ? sentence.length
        : currentChunk.length + 1 + sentence.length;

    // Kiểm tra xem câu mới có vừa không
    if (lengthWithNewSentence <= maxCharsPerChunk) {
      // TH 1: Vừa -> Thêm vào chunk hiện tại
      // Dùng template string cho dễ đọc
      currentChunk =
        currentChunk.length === 0 ? sentence : `${currentChunk} ${sentence}`;
    } else {
      // TH 2: Không vừa
      // Nếu chunk hiện tại có nội dung, push nó vào mảng
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      // Bắt đầu chunk mới với câu hiện tại (ngay cả khi nó dài hơn max)
      currentChunk = sentence;
    }
  }

  // 3. Đừng quên push chunk cuối cùng
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  console.log({ chunks });

  return chunks;
}

// Hàm renderPromptText hiển thị đoạn text hiện tại (currentChunk)
// với highlight cho phần đã gõ, caret nhấp nháy ở ký tự tiếp theo,
// và phần còn lại hiển thị mờ.
export const renderPromptText = (currentChunk: string, userInput: string) => {
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
