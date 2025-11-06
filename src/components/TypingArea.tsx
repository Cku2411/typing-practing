"use client";
import { useTypingStore } from "@/lib/store/typingStore";
import { renderLesson, splitLessonToSentences } from "@/lib/typingUtils";
import { useEffect, useRef, useState } from "react";

interface TypingAreaProps {
  lesson: string;
  onReset: () => void;
}

const TypingArea = ({ lesson, onReset }: TypingAreaProps) => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  // const [wpm, setWpm] = useState(0);
  // const [accuracy, setAccuracy] = useState(100);

  const { setWrongKey, setExpectedChar } = useTypingStore();
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (lesson) {
      setSentences(splitLessonToSentences(lesson));
      setCurrentSentenceIndex(0);
      setUserInput("");
      setStartTime(null);
      // setWpm(0);
      // setAccuracy(100);
    }
  }, [lesson]);

  const currentSentence = sentences[currentSentenceIndex] || "";
  const isCompleteSentence = userInput.length >= currentSentence.length;
  const isLessonComplete =
    currentSentenceIndex === sentences.length - 1 && isCompleteSentence;

  useEffect(() => {
    errorSoundRef.current = new Audio("/error_sound.mp3");
  }, []);

  useEffect(() => {
    // mỗi lần userInput thay đổi → cập nhật expectedChar
    const nextChar = currentSentence[userInput.length] || "";
    setExpectedChar(nextChar);
  }, [userInput, currentSentence, setExpectedChar]);

  // Lắng nghe phím gõ toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLessonComplete) return;

      if (!startTime) {
        setStartTime(Date.now());
      }
      const nextChar = currentSentence[userInput.length];
      if (e.key === "Backspace") {
        setUserInput((prev) => prev.slice(0, -1));
      }
      if (e.key === nextChar) {
        setUserInput(userInput + e.key);
        setWrongKey(null);
      } else {
        // gõ sai → highlight phím sai + phát âm thanh
        setWrongKey(e.key);
        // if (errorSoundRef.current) {
        //   errorSoundRef.current.currentTime = 0;
        //   errorSoundRef.current.play();
        // }
        setTimeout(() => setWrongKey(null), 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLessonComplete, startTime, currentSentence, userInput]);

  // Khi gõ xong chunk → sang chunk mới
  useEffect(() => {
    if (isCompleteSentence && !isLessonComplete) {
      setCurrentSentenceIndex((prev) => prev + 1);
      setUserInput("");
    }

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isLessonComplete) {
        onReset();
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [isCompleteSentence, isLessonComplete, onReset]);

  // Tính WPM & Accuracy
  useEffect(() => {
    if (!startTime) return;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const correctChars = userInput.length; // vì chỉ lưu ký tự đúng
    const wordsTyped = correctChars / 5;
    // setWpm(elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0);

    // setAccuracy(
    //   correctChars > 0
    //     ? Math.round((correctChars / (userInput.length || 1)) * 100)
    //     : 100,
    // );
  }, [userInput, startTime]);

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      {/* Prompt hiển thị */}
      <div className="mt-10 flex min-h-32 items-center justify-center rounded-lg p-8">
        <div className="w-full font-mono leading-relaxed break-words whitespace-pre-wrap">
          {renderLesson(currentSentence, userInput)}
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
