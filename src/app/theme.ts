import {
  Badge,
  Combobox,
  Input,
  Menu,
  Modal,
  MultiSelect,
  Paper,
  Select,
  Table,
  createTheme,
  defaultVariantColorsResolver,
  type CSSVariablesResolver,
} from "@mantine/core";
import classes from "./providers/styles/Theme.module.css";

export const theme = createTheme({
  primaryColor: "primary",
  primaryShade: { light: 8, dark: 5 },
  defaultRadius: "lg",

  variantColorResolver: (input) => {
    const colors = defaultVariantColorsResolver(input);
    return input.variant === "filled" &&
      input.color === input.theme.primaryColor
      ? {
          ...colors,
          color:
            "light-dark(var(--mantine-color-white), var(--mantine-color-secondary-9))",
        }
      : colors;
  },

  colors: {
    dark: [
      "#e9f1f5",
      "#d0e0e8",
      "#afc4cf",
      "#829faa",
      "#486674",
      "#294651",
      "#1b3945",
      "#102b35",
      "#0b242d",
      "#061b23",
    ],
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

  components: {
    Paper: Paper.extend({ classNames: { root: classes.surface } }),
    Modal: Modal.extend({
      classNames: { content: classes.surface, header: classes.surface },
    }),
    Menu: Menu.extend({ classNames: { dropdown: classes.surface } }),
    Combobox: Combobox.extend({ classNames: { dropdown: classes.surface } }),
    MultiSelect: MultiSelect.extend({
      classNames: { dropdown: classes.surface },
    }),
    Select: Select.extend({ classNames: { dropdown: classes.surface } }),
    Input: Input.extend({ classNames: { input: classes.input } }),
    Table: Table.extend({
      defaultProps: { horizontalSpacing: "md", verticalSpacing: "md" },
      classNames: { table: classes.table },
    }),
    Badge: Badge.extend({ classNames: { root: classes.status } }),
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

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "var(--mantine-color-white)",
    "--mantine-color-text": "var(--mantine-color-black)",
    "--mantine-color-background": "var(--mantine-color-white)",
  },
  dark: {
    "--mantine-color-body": "var(--mantine-color-dark-9)",
    "--mantine-color-text": "var(--mantine-color-white)",
    "--mantine-color-background": "var(--mantine-color-dark-7)",
    "--mantine-color-dimmed": "var(--mantine-color-dark-2)",
    "--mantine-color-placeholder": "var(--mantine-color-dark-2)",
    "--mantine-color-default": "var(--mantine-color-dark-6)",
    "--mantine-color-default-hover": "var(--mantine-color-dark-5)",
    "--mantine-color-default-border": "var(--mantine-color-dark-5)",
    "--mantine-color-default-color": "var(--mantine-color-white)",
    "--mantine-color-error": "var(--mantine-color-red-4)",
    "--mantine-color-primary-contrast": "var(--mantine-color-secondary-9)",
    "--mantine-color-primary-light": "#22521d",
    "--mantine-color-primary-light-hover": "#2a6223",
    "--mantine-color-primary-light-color": "var(--mantine-color-primary-1)",
    "--mantine-color-green-light": "#1d662c",
    "--mantine-color-green-light-hover": "#257936",
    "--mantine-color-green-light-color": "var(--mantine-color-white)",
    "--mantine-color-yellow-light": "#855500",
    "--mantine-color-yellow-light-hover": "#996400",
    "--mantine-color-yellow-light-color": "var(--mantine-color-white)",
    "--mantine-color-orange-light": "#96360f",
    "--mantine-color-orange-light-hover": "#aa4118",
    "--mantine-color-orange-light-color": "var(--mantine-color-white)",
    "--mantine-color-red-light": "#96232a",
    "--mantine-color-red-light-hover": "#aa2b33",
    "--mantine-color-red-light-color": "var(--mantine-color-white)",
    "--mantine-color-gray-light": "var(--mantine-color-dark-5)",
    "--mantine-color-gray-light-hover": "var(--mantine-color-dark-4)",
    "--mantine-color-gray-light-color": "var(--mantine-color-dark-0)",
  },
});
