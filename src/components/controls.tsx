import { RefreshCw, Volume2, VolumeX, type LucideIcon } from "lucide-react";
import React, { useState } from "react";

const Controls = ({ reload }: { reload: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const Icon: LucideIcon = isPlaying ? Volume2 : VolumeX;

  const handleReload = () => {
    setIsLoading(true);
    reload();
    // giả sử reload chỉ random local lesson, không cần chờ
    setTimeout(() => setIsLoading(false), 1000); // cho icon quay nhẹ 0.5s
  };

  const handlePlaying = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="flex justify-end gap-3.5">
      <RefreshCw
        className={`anim stroke-gray-500 stroke-3 transition-transform duration-300 ease-in-out hover:scale-[1.2] ${isLoading ? "animate-spin" : ""}`}
        size={35}
        onClick={handleReload}
      />

      <Icon
        size={35}
        onClick={handlePlaying}
        className="stroke-gray-500 stroke-3 transition-transform duration-100 ease-in-out hover:scale-[1.2]"
      />
    </div>
  );
};

export default Controls;
