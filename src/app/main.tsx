import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@gfazioli/mantine-qr-code/styles.css";
import "dayjs/locale/ru";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { DatesProvider } from "@mantine/dates";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./providers/store/store";
import { cssVariablesResolver, theme } from "./theme";
import { Router } from "./providers/routes/Router";
import { DesktopShell } from "@/widgets/desktop-shell";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={localStorageColorSchemeManager({
          key: "stoq-color-scheme",
        })}
        cssVariablesResolver={cssVariablesResolver}
      >
        <Notifications />
        <DatesProvider settings={{ locale: "ru", firstDayOfWeek: 1 }}>
          <DesktopShell>
            <Router />
          </DesktopShell>
        </DatesProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
);
