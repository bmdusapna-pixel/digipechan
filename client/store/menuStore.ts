import { create } from "zustand";

interface MenuStore {
    menuActiveItem: string;
    setMenuActiveItem: (item: string) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
    menuActiveItem: "Home",
    setMenuActiveItem: (item) => set({ menuActiveItem: item }),
}));
