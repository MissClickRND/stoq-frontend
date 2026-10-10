import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./providers/store/store";
import { cssVariablesResolver, theme } from "./theme";
import { Router } from "./providers/routes/Router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={localStorageColorSchemeManager({ key: "stoq-color-scheme" })}
        cssVariablesResolver={cssVariablesResolver}
      >
        <Notifications />
        <Router />
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
);
