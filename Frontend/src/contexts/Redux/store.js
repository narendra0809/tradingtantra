import { configureStore } from "@reduxjs/toolkit";
import themeSlice from '../Redux/Slices/themeSlice.js';
import sideBarTogglerSlice from '../Redux/Slices/sidebarTogglerSlice.js';
 


export const store = configureStore({
    reducer:{
        theme: themeSlice,
        sidebar: sideBarTogglerSlice
       
    }
})