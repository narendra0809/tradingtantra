import { createSlice } from "@reduxjs/toolkit";

const sideBarTogglerSlice = createSlice({
  name: "sidebar",
  initialState: {
    sideBarToggler: false,
  },
  reducers: {
    toggleSideBar: (state) => {
      state.sideBarToggler = !state.sideBarToggler;
    },
  },
});

export const { toggleSideBar } = sideBarTogglerSlice.actions;
export default sideBarTogglerSlice.reducer;
