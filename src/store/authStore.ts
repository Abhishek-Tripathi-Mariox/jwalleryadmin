import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "../types";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin) => {
        localStorage.setItem("adminToken", token);
        set({ token, admin, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        set({ token: null, admin: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth",
    },
  ),
);
