"use client";

import { useEffect, useState } from "react";
import ImprovedKeyboard from "@/components/keyboardLayout";
import TypingArea from "@/components/TypingArea";
import {
  getRandomLesson,
  typingLessons,
  type WikiLesson,
} from "@/utils/typingLesson";
import NavbarControls from "@/components/NavbarControls";

export default function TypingPracticeApp() {
  const [lessons, setLessons] = useState<WikiLesson[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentLesson, setCurrentLesson] = useState("");

  // getlesson from start
  const fetchLesson = async () => {
    const text = typingLessons;
    setLessons(text);
    setCurrentLesson(getRandomLesson(text));
  };

  // Lấy lesson ngẫu nhiên khi load và các setting

  useEffect(() => {
    fetchLesson();
    // lay setting tu localstorage
    const soundSettings = localStorage.getItem("soundEnabled");
    if (soundSettings !== null) {
      setSoundEnabled(soundSettings === "true");
    }
  }, []);

  // Mỗi khi soundEnabled thay đổi → lưu vào localStorage
  // useEffect(() => {
  //   localStorage.setItem("soundEnabled", String(soundEnabled));
  // }, [soundEnabled]);

  const handleNextLesson = () => {
    if (lessons.length > 0) {
      setCurrentLesson(getRandomLesson(lessons));
    } else {
      // Nếu không có bài học nào (ví dụ: lỗi fetch ban đầu), thử fetch lại
      fetchLesson();
    }
  };

  return (
    <div className="bg-bg h-screen w-screen overflow-hidden">
      <main className="mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-8">
        <NavbarControls
          onRefresh={handleNextLesson}
          setLessons={setLessons}
          setCurrentLesson={setCurrentLesson}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
        <TypingArea promptText={currentLesson} onReset={handleNextLesson} />
        <ImprovedKeyboard soundEnabled={soundEnabled} />
      </main>
    </div>
  );
}
