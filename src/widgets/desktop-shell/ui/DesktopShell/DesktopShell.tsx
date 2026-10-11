import type { ReactNode } from "react";
import classes from "./DesktopShell.module.css";

export function DesktopShell({ children }: { children: ReactNode }) {
  if (!/\bElectron\//.test(navigator.userAgent)) return <>{children}</>;
  return (
    <div className={classes.shell}>
      <header className={classes.titlebar} aria-label="Панель окна STOQ">
        <img src="/favicon.svg" width={20} height={20} alt="" />
        <span>STOQ</span>
      </header>
      <div className={classes.content}>{children}</div>
    </div>
  );
}
