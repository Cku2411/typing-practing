import { create } from "zustand";

interface TypingStore {
  expectedChar: string;
  wrongKey: string | null;
  setExpectedChar: (char: string) => void;
  setWrongKey: (char: string | null) => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  expectedChar: "",
  wrongKey: null,
  setExpectedChar: (char) => set({ expectedChar: char }),
  setWrongKey: (char) => set({ wrongKey: char }),
}));
