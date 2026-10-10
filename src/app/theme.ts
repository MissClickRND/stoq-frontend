import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "primary",

  colors: {
    primary: [
      "#fdf2f4",
      "#f5d5da",
      "#e8a8b2",
      "#d97a89",
      "#c94d61",
      "#b32d44",
      "#8b1a2f",
      "#721527",
      "#59101e",
      "#400b16",
    ],
  },

  breakpoints: {
    xs: "30em",
    sm: "48em",
    md: "64em",
    lg: "74em",
    xl: "90em",
    xxl: "120em",
  },
});
