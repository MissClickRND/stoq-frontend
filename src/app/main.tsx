import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./providers/store/store";
import { theme } from "./theme";
import { Router } from "./providers/routes/Router";
import { AuthGuard } from "./providers/guards/AuthGuard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <AuthGuard>
          <Notifications />
          <Router />
        </AuthGuard>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
);
