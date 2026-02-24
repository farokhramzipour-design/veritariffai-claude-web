import create from 'zustand';
import { persist } from 'zustand/middleware';

// Placeholder type
type Toast = { id: string; type: 'success' | 'error'; message: string; };

interface UIState {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  activeModal: string | null;
  toggleSidebar: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toasts: [],
      activeModal: null,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: new Date().toISOString() }],
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }), // Only persist sidebarCollapsed
    }
  )
);
