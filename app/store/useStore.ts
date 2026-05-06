import { create } from 'zustand';
import {Order} from '../orderArray';

interface State {
  toggle: number;
  setToggle: (id: number) => void;
  profileModal: number;
  setProfileModal: (id: number) => void;
  shoppingCardModal: number;
  setShoppingCardModal: (id: number) => void;
  supportModal: number;
  setSupportModal: (id: number) => void;
  menuMobileModal: number;
  setMenuMobileModal: (id: number) => void;
  order: Order | undefined;
  setOrder: (order: Order) => void;
}

export const useStore = create<State>((set) => ({
  toggle: 1, // начальное значение
  setToggle: (id) => set({ toggle: id }),
  profileModal: 0,
  setProfileModal: (id) => set({ profileModal: id }),
  shoppingCardModal: 0,
  setShoppingCardModal: (id) => set({ shoppingCardModal: id }),
  supportModal: 0,
  setSupportModal: (id) => set({ supportModal: id }),
  menuMobileModal: 0,
  setMenuMobileModal: (id) => set({ menuMobileModal: id }),
  order: undefined,
  setOrder: (order) => set({ order }),
}));