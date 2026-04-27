import { create } from 'zustand';

interface State {
  toggle: number;
  setToggle: (id: number) => void;
  profileModal: number;
  setProfileModal: (id: number) => void;
  shoppingCardModal: number;
  setShoppingCardModal: (id: number) => void;
}

export const useStore = create<State>((set) => ({
  toggle: 1, // начальное значение
  setToggle: (id) => set({ toggle: id }),
  profileModal: 0, // начальное значение
  setProfileModal: (id) => set({ profileModal: id }),
  shoppingCardModal: 0, // начальное значение
  setShoppingCardModal: (id) => set({ shoppingCardModal: id }),
}));