import { create } from "zustand";

export type ViewType = "home" | "search" | "library" | "playlist" | "artist" | "album" | "settings" | "dj";

interface ViewState {
  currentView: ViewType;
  viewParams: Record<string, string>;
  viewHistory: Array<{ view: ViewType; params: Record<string, string> }>;
  setView: (view: ViewType, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const useViewStore = create<ViewState>((set, get) => ({
  currentView: "home",
  viewParams: {},
  viewHistory: [],

  setView: (view, params = {}) => {
    const state = get();
    set({
      viewHistory: [...state.viewHistory, { view: state.currentView, params: state.viewParams }],
      currentView: view,
      viewParams: params,
    });
  },

  goBack: () => {
    const state = get();
    if (state.viewHistory.length === 0) return;
    const prev = state.viewHistory[state.viewHistory.length - 1];
    set({
      currentView: prev.view,
      viewParams: prev.params,
      viewHistory: state.viewHistory.slice(0, -1),
    });
  },
}));
