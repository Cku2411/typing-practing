"use client";
import {
  renderPromptText,
  splitIntoChunksBySentences,
} from "@/lib/typingUtils";
import { useEffect, useState } from "react";

interface TypingAreaProps {
  promptText: string;
  onReset: () => void;
}

const TypingArea = ({ promptText, onReset }: TypingAreaProps) => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    if (promptText) {
      setChunks(splitIntoChunksBySentences(promptText));
      setCurrentChunkIndex(0);
      setUserInput("");
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
    }
  }, [promptText]);

  const currentChunk = chunks[currentChunkIndex] || "";
  const isCompleteChunk = userInput.length >= currentChunk.length;
  const isLessonComplete =
    currentChunkIndex === chunks.length - 1 && isCompleteChunk;

  console.log({ isLessonComplete });

  // Lắng nghe phím gõ toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLessonComplete) return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      if (e.key === "Backspace") {
        setUserInput((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        // chỉ nhận ký tự in ra được
        setUserInput((prev) => {
          const nextChar = currentChunk[prev.length];
          // chỉ chấp nhận ký tự nếu đúng với prompt
          if (e.key === nextChar) {
            return prev + e.key;
          }
          return prev; // nếu sai thì bỏ qua, caret không tiến
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLessonComplete, startTime, currentChunk]);

  // Khi gõ xong chunk → sang chunk mới
  useEffect(() => {
    if (isCompleteChunk && !isLessonComplete) {
      setCurrentChunkIndex((prev) => prev + 1);
      setUserInput("");
    }

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isLessonComplete) {
        onReset();
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [isCompleteChunk, isLessonComplete, onReset]);

  // Tính WPM & Accuracy
  useEffect(() => {
    if (!startTime) return;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const correctChars = userInput.length; // vì chỉ lưu ký tự đúng
    const wordsTyped = correctChars / 5;
    setWpm(elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0);

    setAccuracy(
      correctChars > 0
        ? Math.round((correctChars / (userInput.length || 1)) * 100)
        : 100,
    );
  }, [userInput, startTime]);

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      {/* Prompt hiển thị */}
      <div className="mt-10 flex min-h-32 items-center justify-center rounded-lg p-8">
        <div className="w-full font-mono leading-relaxed break-words whitespace-pre-wrap">
          {renderPromptText(currentChunk, userInput)}
        </div>
      </div>

      {isLessonComplete && (
        <div className="mt-6 text-center">
          <div className="mb-4 text-2xl font-bold text-green-600">
            ✓ Complete!
          </div>
          <button
            onClick={onReset}
            className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-600"
          >
            Next Lesson
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
