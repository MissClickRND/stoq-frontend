import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "primary",
  primaryShade: { light: 8, dark: 5 },
  autoContrast: true,
  other: { secondaryColor: "secondary" },

  colors: {
    primary: [
      "#f2fee5",
      "#e6f9d2",
      "#cef0a8",
      "#b4e87b",
      "#99df4b",
      "#90dc3b",
      "#88da2c",
      "#74c11d",
      "#66ac14",
      "#549403",
    ],

    secondary: [
      "#ebfeff",
      "#d7fafd",
      "#aaf6fc",
      "#7df2fb",
      "#61effa",
      "#55edfa",
      "#4decfb",
      "#40d2df",
      "#2fbbc7",
      "#002a2d",
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
