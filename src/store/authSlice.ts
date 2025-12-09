import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = { token?: string; user?: { email: string } | null };
const initialState: AuthState = { token: undefined, user: null };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthState>) {
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;
      if (typeof window !== "undefined" && action.payload.token) {
        localStorage.setItem("access_token", action.payload.token);
      }
    },
    logout(state) {
      state.token = undefined;
      state.user = null;
      if (typeof window !== "undefined")
        localStorage.removeItem("access_token");
    },
  },
});

export const { setAuth, logout } = slice.actions;
export default slice.reducer;
