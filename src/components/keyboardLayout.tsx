import { useTypingStore } from "@/lib/store/typingStore";
import { useState, useEffect, useRef } from "react";

// Type definitions
type FingerType =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky"
  | "thumb";

interface KeyData {
  key: string;
  finger: FingerType;
  homeRow?: boolean;
  width?: number; // relative width multiplier
}

// Keyboard layout configuration
const keyboardRows: KeyData[][] = [
  [
    { key: "`", finger: "left-pinky", width: 1 },
    { key: "1", finger: "left-pinky", width: 1 },
    { key: "2", finger: "left-ring", width: 1 },
    { key: "3", finger: "left-middle", width: 1 },
    { key: "4", finger: "left-index", width: 1 },
    { key: "5", finger: "left-index", width: 1 },
    { key: "6", finger: "right-index", width: 1 },
    { key: "7", finger: "right-index", width: 1 },
    { key: "8", finger: "right-middle", width: 1 },
    { key: "9", finger: "right-ring", width: 1 },
    { key: "0", finger: "right-pinky", width: 1 },
    { key: "-", finger: "right-pinky", width: 1 },
    { key: "=", finger: "right-pinky", width: 1 },
  ],
  [
    { key: "Q", finger: "left-pinky", width: 1 },
    { key: "W", finger: "left-ring", width: 1 },
    { key: "E", finger: "left-middle", width: 1 },
    { key: "R", finger: "left-index", width: 1 },
    { key: "T", finger: "left-index", width: 1 },
    { key: "Y", finger: "right-index", width: 1 },
    { key: "U", finger: "right-index", width: 1 },
    { key: "I", finger: "right-middle", width: 1 },
    { key: "O", finger: "right-ring", width: 1 },
    { key: "P", finger: "right-pinky", width: 1 },
    { key: "[", finger: "right-pinky", width: 1 },
    { key: "]", finger: "right-pinky", width: 1 },
    { key: "\\", finger: "right-pinky", width: 1 },
  ],
  [
    { key: "A", finger: "left-pinky", homeRow: true, width: 1 },
    { key: "S", finger: "left-ring", homeRow: true, width: 1 },
    { key: "D", finger: "left-middle", homeRow: true, width: 1 },
    { key: "F", finger: "left-index", homeRow: true, width: 1 },
    { key: "G", finger: "left-index", width: 1 },
    { key: "H", finger: "right-index", width: 1 },
    { key: "J", finger: "right-index", homeRow: true, width: 1 },
    { key: "K", finger: "right-middle", homeRow: true, width: 1 },
    { key: "L", finger: "right-ring", homeRow: true, width: 1 },
    { key: ";", finger: "right-pinky", homeRow: true, width: 1 },
    { key: "'", finger: "right-pinky", width: 1 },
  ],
  [
    { key: "Z", finger: "left-pinky", width: 1 },
    { key: "X", finger: "left-ring", width: 1 },
    { key: "C", finger: "left-middle", width: 1 },
    { key: "V", finger: "left-index", width: 1 },
    { key: "B", finger: "left-index", width: 1 },
    { key: "N", finger: "right-index", width: 1 },
    { key: "M", finger: "right-index", width: 1 },
    { key: ",", finger: "right-middle", width: 1 },
    { key: ".", finger: "right-ring", width: 1 },
    { key: "/", finger: "right-pinky", width: 1 },
  ],
  [{ key: " ", finger: "thumb", width: 6 }],
];

// Finger color mapping
const fingerColors: Record<
  FingerType,
  { bg: string; hover: string; text: string }
> = {
  "left-pinky": {
    bg: "bg-pink-200",
    hover: "hover:bg-pink-300",
    text: "Pinky",
  },
  "left-ring": {
    bg: "bg-purple-200",
    hover: "hover:bg-purple-300",
    text: "Ring",
  },
  "left-middle": {
    bg: "bg-blue-200",
    hover: "hover:bg-blue-300",
    text: "Middle",
  },
  "left-index": {
    bg: "bg-green-200",
    hover: "hover:bg-green-300",
    text: "Index",
  },
  "right-index": {
    bg: "bg-green-200",
    hover: "hover:bg-green-300",
    text: "Index",
  },
  "right-middle": {
    bg: "bg-blue-200",
    hover: "hover:bg-blue-300",
    text: "Middle",
  },
  "right-ring": {
    bg: "bg-purple-200",
    hover: "hover:bg-purple-300",
    text: "Ring",
  },
  "right-pinky": {
    bg: "bg-pink-200",
    hover: "hover:bg-pink-300",
    text: "Pinky",
  },
  thumb: { bg: "bg-yellow-200", hover: "hover:bg-yellow-300", text: "Thumb" },
};

const ImprovedKeyboard = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [currentKey, setCurrentKey] = useState("");
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  const { expectedChar, wrongKey } = useTypingStore();

  const normalizedExpected =
    expectedChar === " " ? " " : expectedChar.toUpperCase();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/key_sound.mp3");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      if (audioRef.current && soundEnabled) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
        });
      }

      setCurrentKey(e.key);
    };

    const handleKeyUp = () => {
      setCurrentKey("");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [soundEnabled]);

  const normalizedKey = currentKey === " " ? " " : currentKey.toUpperCase();
  const normalizedWrong = wrongKey === " " ? " " : wrongKey?.toUpperCase();

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg p-4 opacity-50">
      <div className="mx-auto flex flex-col items-center justify-center">
        {/* Keyboard */}
        <div className="rounded-xlp-8">
          <div className="space-y-2">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {row.map((keyData, keyIndex) => {
                  const isExpected = normalizedExpected === keyData.key;
                  const isWrong = normalizedWrong === keyData.key;
                  const isActive =
                    normalizedKey === keyData.key ||
                    (normalizedKey === " " && keyData.key === " ");
                  const colors = fingerColors[keyData.finger];

                  return (
                    <div
                      key={keyIndex}
                      className={` ${colors.bg} ${colors.hover} ${isExpected ? "scale-110 shadow-lg ring-4 shadow-yellow-400/50 ring-yellow-400" : ""} ${keyData.homeRow ? "border-b-4 border-gray-600" : ""} ${isWrong ? "animate-shake scale-110 ring-4 ring-red-500" : ""} relative flex min-h-[50px] items-center justify-center rounded-lg px-4 py-3 transition-all duration-150 ease-out`}
                      style={{
                        width: keyData.width
                          ? `${keyData.width * 60}px`
                          : "60px",
                        minWidth:
                          keyData.width && keyData.width > 1
                            ? `${keyData.width * 60}px`
                            : "50px",
                      }}
                    >
                      <span className="text-lg font-semibold text-gray-900 select-none">
                        {keyData.key === " " ? "Space" : keyData.key}
                      </span>
                      {keyData.homeRow && (
                        <div className="absolute bottom-2 h-1.5 w-2 rounded-full bg-gray-900"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            {Object.entries(fingerColors)
              .filter((_, i, arr) => {
                // Remove duplicate entries (only show unique fingers)
                const finger = _[0];
                if (finger.includes("left") || finger === "thumb") return true;
                return false;
              })
              .map(([finger, colors]) => (
                <div
                  key={finger}
                  className="flex items-center gap-2 text-white"
                >
                  <div className={`h-4 w-4 rounded ${colors.bg}`}></div>
                  <span>{colors.text}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Instructions */}
        {/* <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            Start typing to see which finger should press each key. Home row
            keys (F, J) are marked with dots.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default ImprovedKeyboard;
