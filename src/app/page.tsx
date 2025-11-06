"use client";

import Controls from "@/components/controls";
import ImprovedKeyboard from "@/components/keyboardLayout";
import TypingArea from "@/components/TypingArea";
import { getRandomLesson } from "@/utils/typingLesson";
import { useEffect, useState } from "react";

export default function TypingPracticeApp() {
  const [lesson, setLesson] = useState("");

  // Lấy lesson ngẫu nhiên khi load
  useEffect(() => {
    setLesson(getRandomLesson());
  }, []);

  const handleReset = () => {
    setLesson(getRandomLesson());
  };

  return (
    <div className="bg-bg h-screen w-screen overflow-hidden">
      <main className="mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-8">
        <Controls reload={handleReset} />
        <TypingArea promptText={lesson} onReset={handleReset} />
        <ImprovedKeyboard />
      </main>
    </div>
  );
}
