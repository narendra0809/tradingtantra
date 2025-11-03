import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie"
const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: Cookies.get("theme"),
  },
  reducers: {
    setTheme: (state, action) => {
      console.log(action.payload,state)
      state.theme = action.payload;
      Cookies.set("theme",action.payload)
    },
    
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
