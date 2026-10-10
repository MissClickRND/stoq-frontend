import { createSlice } from "@reduxjs/toolkit";
import { IUserState } from "./type";

const initialState: IUserState = {
  id: undefined,
  name: undefined,
  email: undefined,
  phone: undefined,
  role: "CUSTOMER",
  createdAt: undefined,
  updatedAt: undefined,
  userAllergens: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.role = action.payload.role;
      state.createdAt = action.payload.createdAt;
      state.updatedAt = action.payload.updatedAt;
      state.userAllergens = action.payload.userAllergens;
    },

    userLogout: (state) => {
      state.id = undefined;
      state.name = undefined;
      state.email = undefined;
      state.phone = undefined;
      state.role = "CUSTOMER";
      state.createdAt = undefined;
      state.updatedAt = undefined;
      state.userAllergens = [];
    },
  },
});

export const { setUser, userLogout } = userSlice.actions;
export const userReducer = userSlice.reducer;
