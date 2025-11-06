import { getWikiLessons } from "@/lib/wiki";
import { getRandomLesson, type WikiLesson } from "@/utils/typingLesson";
import {
  BookOpenText,
  RefreshCw,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import React, { useState } from "react";

const NavbarControls = ({
  onRefresh,
  setLessons,
  setCurrentLesson,
  soundEnabled,
  setSoundEnabled,
}: {
  onRefresh: () => void;
  setLessons: (lessons: WikiLesson[]) => void;
  setCurrentLesson: (lesson: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLesson = async () => {
    const text = await getWikiLessons("Science");
    setLessons(text);
    setCurrentLesson(getRandomLesson(text));
  };

  console.log({ soundEnabled });

  const Icon: LucideIcon = soundEnabled ? Volume2 : VolumeX;

  const handleFetching = async () => {
    setIsLoading(true);
    await fetchLesson();

    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();

    // new Promise((res) => setTimeout(res(), 1000));

    setIsRefreshing(false);
  };

  const handlePlaying = () => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("soundEnabled", String(newValue));
      return newValue;
    });
  };

  return (
    <div className="flex justify-between">
      {/* source */}
      <div>
        <BookOpenText
          className={`stroke-gray-500 stroke-3 transition-transform duration-300 ease-in-out hover:scale-[1.2] ${isLoading ? "animate-flip" : ""}`}
          size={35}
          onClick={handleFetching}
        />
      </div>

      {/* controls */}

      <div className="flex justify-end gap-3.5">
        <RefreshCw
          className={`stroke-gray-500 stroke-3 transition-transform duration-300 ease-in-out hover:scale-[1.2] ${isLoading ? "animate-spin" : ""}`}
          size={35}
          onClick={handleRefresh}
        />

        <Icon
          size={35}
          onClick={handlePlaying}
          className="stroke-gray-500 stroke-3 transition-transform duration-100 ease-in-out hover:scale-[1.2]"
        />
      </div>
    </div>
  );
};

export default NavbarControls;
