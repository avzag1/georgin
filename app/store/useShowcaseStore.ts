import { create } from 'zustand';

interface ShowcaseState {
  toggle: number;
  setToggle: (id: number) => void;
}

export const useShowcaseStore = create<ShowcaseState>((set) => ({
  toggle: 1, // начальное значение
  setToggle: (id) => set({ toggle: id }),
}));